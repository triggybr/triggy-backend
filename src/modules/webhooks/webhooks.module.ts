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
import { LastlinkAbandonedCartToHotzappCreateProductMapper } from './mappers/destination-mappers/lastlink-abandoned-cart__hotzapp-create-product.mapper';

const mappersProviders = [
  {
    provide: DESTINATION_MAPPERS,
    useFactory: (
      lastlinkToHotzapp: LastlinkAbandonedCartToHotzappCreateProductMapper,
    ) => [lastlinkToHotzapp],
    inject: [LastlinkAbandonedCartToHotzappCreateProductMapper],
  },
];

const providers = [
  WebhooksService,
  SqsConsumer,
  EventMappingOrchestrator,
  LastlinkAbandonedCartToHotzappCreateProductMapper,
  ...mappersProviders,
]

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Webhook.name, schema: WebhookSchema },
      { name: UserIntegration.name, schema: UserIntegrationSchema },
      { name: UserStats.name, schema: UserStatsSchema },
      { name: Signature.name, schema: SignatureSchema },
    ]),
    ConfigModule,
  ],
  controllers: [WebhooksController],
  providers,
  exports: [WebhooksService, EventMappingOrchestrator],
})
export class WebhooksModule {}