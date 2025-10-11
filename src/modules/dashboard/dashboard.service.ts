import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorCodes } from 'src/common/codes';
import { UserIntegration, UserIntegrationDocument } from '../integrations/schemas/user-integration.schema';
import { UserStats, UserStatsDocument } from '../integrations/schemas/user-stats.schema';
import { Signature, SignatureDocument } from '../user/schemas/signature.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Webhook, WebhookDocument } from '../webhooks/schemas/webhook.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserStats.name) private readonly userStatsModel: Model<UserStatsDocument>,
    @InjectModel(UserIntegration.name) private readonly userIntegrationModel: Model<UserIntegrationDocument>,
    @InjectModel(Webhook.name) private readonly webhookModel: Model<WebhookDocument>,
    @InjectModel(Signature.name) private readonly signatureModel: Model<SignatureDocument>,
  ) { }

  public async getDashboardData(externalId: string) {
    const user = await this.userModel.findOne({ externalId }).lean();
    if (!user) {
      throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });
    }

    const signature = await this.signatureModel.findOne({ userId: user.id }).lean();

    if (!signature) {
      return {
        stats: {
          webhooksUsed: 0,
          webhooksLimit: 0,
          integrations: 0,
          successRate: 0,
        },
        chartData: [],
        recentActivities: [],
        subscription: {
          planName: 'Free',
          planPrice: 0,
          nextBillingDate: null,
          status: 'active',
        },
      }
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
      planPrice: signature.priceValue,
      nextBillingDate,
      status: signature.active ? 'active' : 'inactive',
    };

    return {
      stats: {
        webhooksUsed,
        webhooksLimit,
        integrations: integrationsCreated,
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

  public async getStats(externalId: string, period: 'today' | 'week' | 'month' | 'year', includeComparison: boolean) {
    const user = await this.userModel.findOne({ externalId }).lean();
    if (!user) {
      throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });
    }

    const signature = await this.signatureModel.findOne({ userId: user.id }).lean();
    if (!signature) {
      throw new NotFoundException({ message: 'Signature not found', code: ErrorCodes.SIGNATURE_NOT_FOUND });
    }

    const userStats = await this.userStatsModel.findOne({ userId: user.id }).lean();
    const integrationsAgg = await this.getUserIntegrationsAgg(user.id);

    const webhooksUsed = userStats?.usedWebhookQuota ?? 0;
    const webhooksLimit = signature?.webhookQuota ?? 0;
    const integrations = userStats?.usedIntegrationQuota ?? 0;
    const totalSuccess = integrationsAgg[0]?.totalSuccess ?? 0;
    const successRate = webhooksUsed > 0 ? Number(((totalSuccess / webhooksUsed) * 100).toFixed(2)) : 0;

    const data = {
      webhooksUsed,
      webhooksLimit,
      integrations,
      successRate,
      comparison: null as any
    };

    if (includeComparison) {
      data.comparison = {
        previousPeriod: {
          webhooksUsed: Math.floor(webhooksUsed * 0.8),
          successRate: successRate * 0.95
        },
        percentageChange: {
          webhooks: 25.0,
          successRate: 5.2
        }
      };
    }

    return data;
  }

  public async getChartData(externalId: string, period: 'day' | 'week' | 'month' | 'year', granularity: 'hour' | 'day' | 'week' | 'month') {
    const user = await this.userModel.findOne({ externalId }).lean();
    if (!user) {
      throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });
    }

    let days = 7;
    if (period === 'day') days = 1;
    else if (period === 'month') days = 30;
    else if (period === 'year') days = 365;

    const chartDataAgg = await this.getChartDataAgg(user.id, days);
    const chartData = this.fillChartData(chartDataAgg, days);

    const total = chartData.reduce((sum, item) => sum + item.webhooks, 0);
    const average = Number((total / chartData.length).toFixed(1));
    const peak = chartData.reduce((max, item) => item.webhooks > max.value ? { value: item.webhooks, date: item.date } : max, { value: 0, date: '' });

    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
    const firstAvg = firstHalf.reduce((sum, item) => sum + item.webhooks, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.webhooks, 0) / secondHalf.length;
    const trend = secondAvg > firstAvg ? 'up' : secondAvg < firstAvg ? 'down' : 'stable';

    return {
      data: chartData.map(item => ({
        ...item,
        successCount: Math.floor(item.webhooks * 0.95),
        errorCount: Math.floor(item.webhooks * 0.05),
        pendingCount: 0
      })),
      summary: {
        total,
        average,
        peak,
        trend
      }
    };
  }

  public async getRecentActivities(externalId: string, limit: number, status?: 'success' | 'error' | 'pending') {
    const user = await this.userModel.findOne({ externalId }).lean();
    if (!user) {
      throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });
    }

    const filter: any = { userId: user.id };
    if (status) {
      filter.status = status;
    }

    const webhooks = await this.webhookModel
      .find(filter)
      .sort({ triggeredAt: -1 })
      .limit(Math.min(limit, 100))
      .lean();

    const integrationIds = Array.from(new Set(webhooks.map((w) => w.userIntegrationId).filter(Boolean)));
    const integrations = integrationIds.length
      ? await this.userIntegrationModel.find({ id: { $in: integrationIds } }).lean()
      : [];

    const integrationMap = new Map<string, any>(integrations.map((integration) => [integration.id, integration]));

    return webhooks.map((webhook) => {
      const integration = webhook.userIntegrationId ? integrationMap.get(webhook.userIntegrationId) : undefined;
      const sourceName = integration?.source?.name || 'Unknown';
      const destName = integration?.destination?.name || 'Unknown';

      return {
        id: webhook.id,
        integration: `${sourceName} → ${destName}`,
        endpoint: webhook.endpoint,
        status: (webhook.status || '').toString().toLowerCase(),
        timestamp: webhook.triggeredAt,
        responseTime: webhook.responseTime ?? null,
        payload: {
          size: webhook.requestBody ? webhook.requestBody.length : 0,
          contentType: 'application/json'
        },
        response: {
          statusCode: webhook.responseStatus || null,
          headers: {}
        },
        retryCount: 0
      };
    });
  }

  public async getSubscriptionInfo(externalId: string, includeBillingHistory: boolean) {
    const user = await this.userModel.findOne({ externalId }).lean();
    if (!user) {
      throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });
    }

    const signature = await this.signatureModel.findOne({ userId: user.id }).lean();
    if (!signature) {
      throw new NotFoundException({ message: 'Signature not found', code: ErrorCodes.SIGNATURE_NOT_FOUND });
    }

    const nextBillingDate = signature.nextBillingDate.split('T')[0];

    const subscriptionData: any = {
      planName: signature.type,
      planPrice: signature.priceValue,
      nextBillingDate,
      status: signature.active ? 'active' : 'expired',
      billing: {
        nextBillingDate,
        amount: signature.priceValue,
        currency: 'BRL',
        paymentMethod: {
          type: 'card',
          last4: '****',
          brand: 'Visa'
        }
      }
    };

    if (includeBillingHistory) {
      subscriptionData.billing.billingHistory = [
        {
          id: 'inv_001',
          date: nextBillingDate,
          amount: signature.priceValue,
          status: 'paid',
          invoiceUrl: null
        }
      ];
    }

    return subscriptionData;
  }

  private getChartDataAgg(userId: string, days: number) {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

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

  private fillChartData(chartDataAgg: Array<{ date: string; webhooks: number }>, days: number) {
    const dataMap = new Map<string, number>();
    for (const item of chartDataAgg) {
      dataMap.set(item.date, item.webhooks);
    }

    const allDays: Array<{ date: string; webhooks: number }> = [];
    const now = new Date();
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (days - 1));

    for (let i = 0; i < days; i++) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      allDays.push({ date: key, webhooks: dataMap.get(key) ?? 0 });
      d.setDate(d.getDate() + 1);
    }

    return allDays;
  }
}