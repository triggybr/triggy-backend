import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { UserStats, UserStatsDocument } from '../integrations/schemas/user-stats.schema';
import { UserIntegration, UserIntegrationDocument } from '../integrations/schemas/user-integration.schema';
import { Webhook, WebhookDocument } from '../webhooks/schemas/webhook.schema';
import { ErrorCodes } from 'src/common/codes';
import { formatBRL } from 'src/common/utils/format-brl';
import { Signature, SignatureDocument } from '../user/schemas/signature.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserStats.name) private readonly userStatsModel: Model<UserStatsDocument>,
    @InjectModel(UserIntegration.name) private readonly userIntegrationModel: Model<UserIntegrationDocument>,
    @InjectModel(Webhook.name) private readonly webhookModel: Model<WebhookDocument>,
    @InjectModel(Signature.name) private readonly signatureModel: Model<SignatureDocument>,
  ) {}

  public async getDashboardData(externalId: string) {
    const user = await this.userModel.findOne({ externalId }).lean();
    if (!user) {
      throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });
    }

    const signature = await this.signatureModel.findOne({ userId: user.id }).lean();
    if (!signature) {
      throw new NotFoundException({ message: 'Signature not found', code: ErrorCodes.SIGNATURE_NOT_FOUND });
    }

    const [userStats, integrationsAgg, last7DaysAgg, recentWebhooks] = await Promise.all([
      this.userStatsModel.findOne({ userId: user.id }).lean(),
      this.getUserIntegrationsAgg(user.id),
      this.getLast7DaysAgg(user.id),
      this.getRecentWebhooks(user.id),
    ]);

    const webhooksUsed = userStats?.usedWebhookQuota ?? 0;
    const integrationsCreated = userStats?.usedIntegrationQuota ?? 0;
    const webhooksLimit = signature?.webhookQuota ?? 0;

    const totalSuccess = integrationsAgg[0]?.totalSuccess ?? 0;

    const successRate = webhooksUsed > 0 ? Number(((totalSuccess / webhooksUsed) * 100).toFixed(2)) : 0;

    const webhooksLast7Days = this.fillLast7Days(last7DaysAgg);

    const nextBillingDate = signature?.nextBillingDate.split('T')[0];

    const subscriptionInfo = signature && {
      planName: signature.type,
      planPrice: formatBRL(signature.priceValue),
      nextBillingDate,
      status: signature.active ? 'active' : 'inactive',
    };

    return {
      stats: {
        webhooksUsed,
        webhooksLimit,
        integrationsCreated,
        successRate,
      },
      chartData: webhooksLast7Days,
      recentActivities: recentWebhooks,
      subscription: subscriptionInfo,
    };
  }

  private getUserIntegrationsAgg(userId: string) {
    return this.userIntegrationModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalSuccess: { $sum: { $ifNull: ['$successCount', 0] } },
          totalError: { $sum: { $ifNull: ['$errorCount', 0] } },
        },
      },
    ])
  }

  private async getRecentWebhooks(userId: string) {
    const webhooks = await this.webhookModel
      .find({ userId })
      .sort({ triggeredAt: -1 })
      .limit(10)
      .lean();

    const integrationIds = Array.from(new Set(webhooks.map((w) => w.userIntegrationId).filter(Boolean)));

    const integrations = integrationIds.length
      ? await this.userIntegrationModel.find({ id: { $in: integrationIds } }).lean()
      : [];

    const integrationMap = new Map<string, any>(integrations.map((integration) => [integration.id, integration]));

    return webhooks.map((webhook) => {
      const integration = webhook.userIntegrationId ? integrationMap.get(webhook.userIntegrationId) : undefined;

      return {
        id: webhook.id,
        integration: integration?.name,
        endpoint: webhook.endpoint,
        status: (webhook.status || '').toString().toLowerCase(),
        timestamp: webhook.triggeredAt,
        responseTime: webhook.responseTime ?? null,
      };
    });
  }

  private getLast7DaysAgg(userId: string) {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    return this.webhookModel.aggregate([
      { $match: { userId: userId } },
      { $addFields: { triggeredDate: { $toDate: '$triggeredAt' } } },
      { $match: { triggeredDate: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$triggeredDate' } },
          webhooks: { $sum: 1 },
        },
      },
      { $project: { _id: 0, date: '$_id', webhooks: 1 } },
      { $sort: { date: 1 } },
    ]);
  }

  private fillLast7Days(last7DaysAgg: Array<{ date: string; webhooks: number }>) {
    const lastDaysMap = new Map<string, number>();
    for (const item of last7DaysAgg) {
      lastDaysMap.set(item.date, item.webhooks);
    }

    const all7Days: Array<{ date: string; webhooks: number }> = [];

    const now = new Date();
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 6);

    for (let i = 0; i < 7; i++) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      all7Days.push({ date: key, webhooks: lastDaysMap.get(key) ?? 0 });
      d.setDate(d.getDate() + 1);
    }

    return all7Days;
  }
}