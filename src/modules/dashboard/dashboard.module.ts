import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserIntegration, UserIntegrationSchema } from '../integrations/schemas/user-integration.schema';
import { UserStats, UserStatsSchema } from '../integrations/schemas/user-stats.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Webhook, WebhookSchema } from '../webhooks/schemas/webhook.schema';
import { Signature, SignatureSchema } from '../user/schemas/signature.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserIntegration.name, schema: UserIntegrationSchema },
      { name: UserStats.name, schema: UserStatsSchema },
      { name: User.name, schema: UserSchema },
      { name: Webhook.name, schema: WebhookSchema },
      { name: Signature.name, schema: SignatureSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {} 