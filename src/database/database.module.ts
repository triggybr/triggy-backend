import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Webhook, WebhookSchema } from '../modules/webhooks/schemas/webhook.schema';
import { User, UserSchema } from '../modules/user/schemas/user.schema';
import { Plan, PlanSchema } from '../modules/plans/schemas/plan.schema';
import { Integration, IntegrationSchema } from '../modules/integrations/schemas/integration.schema';
import { UserIntegration, UserIntegrationSchema } from '../modules/integrations/schemas/user-integration.schema';
import { WebhookSeeder } from './seeders/webhook.seeder';
import { UserSeeder } from './seeders/user.seeder';
import { PlanSeeder } from './seeders/plan.seeder';
import { IntegrationSeeder } from './seeders/integration.seeder';
import { UserIntegrationSeeder } from './seeders/user-integration.seeder';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Webhook.name, schema: WebhookSchema },
      { name: User.name, schema: UserSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Integration.name, schema: IntegrationSchema },
      { name: UserIntegration.name, schema: UserIntegrationSchema },
    ]),
  ],
  providers: [
    WebhookSeeder,
    UserSeeder,
    PlanSeeder,
    IntegrationSeeder,
    UserIntegrationSeeder,
  ]
})
export class DatabaseModule { }
