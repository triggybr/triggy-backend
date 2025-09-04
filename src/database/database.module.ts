import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Webhook, WebhookSchema } from '../modules/webhooks/schemas/webhook.schema';
import { WebhookSeeder } from './seeders/webhook.seeder';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Webhook.name, schema: WebhookSchema }]),
  ],
  providers: [WebhookSeeder]
})
export class DatabaseModule {}
