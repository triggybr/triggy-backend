import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './services/webhooks.service';
import { Webhook, WebhookSchema } from './schemas/webhook.schema';
import { SqsConsumer } from './services/sqs-consumer';
import { ConfigModule } from '@nestjs/config';
import { UserIntegration, UserIntegrationSchema } from '../integrations/schemas/user-integration.schema';
import { UserStats, UserStatsSchema } from '../integrations/schemas/user-stats.schema';
import { Signature, SignatureSchema } from '../user/schemas/signature.schema';
import { EventMappingOrchestrator } from './services/event-mapping.orchestrator';
import { DESTINATION_MAPPERS } from './constants/tokens';
import { LastlinkAbandonedCartToHotzappCreateProductMapper } from './mappers/destination-mappers/lastlink/lastlink-abandoned-cart__hotzapp-create-product.mapper';
import { User, UserSchema } from '../user/schemas/user.schema';
import { LastlinkPurchaseConfirmedToThemembersCreateUserMapper } from './mappers/destination-mappers/lastlink/lastlink-purchase-confirmed__themembers-create-user';

const mappersProviders = [
  {
    provide: DESTINATION_MAPPERS,
    useFactory: (
      lastlinkToHotzapp: LastlinkAbandonedCartToHotzappCreateProductMapper,
      lastlinkToThemembersCreateUser: LastlinkPurchaseConfirmedToThemembersCreateUserMapper,
    ) => [lastlinkToHotzapp, lastlinkToThemembersCreateUser],
    inject: [LastlinkAbandonedCartToHotzappCreateProductMapper, LastlinkPurchaseConfirmedToThemembersCreateUserMapper],
  },
];

const providers = [
  WebhooksService,
  SqsConsumer,
  EventMappingOrchestrator,
  LastlinkAbandonedCartToHotzappCreateProductMapper,
  LastlinkPurchaseConfirmedToThemembersCreateUserMapper,
  ...mappersProviders,
]

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Webhook.name, schema: WebhookSchema },
      { name: UserIntegration.name, schema: UserIntegrationSchema },
      { name: UserStats.name, schema: UserStatsSchema },
      { name: Signature.name, schema: SignatureSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ConfigModule,
  ],
  controllers: [WebhooksController],
  providers,
  exports: [WebhooksService, EventMappingOrchestrator],
})
export class WebhooksModule {}