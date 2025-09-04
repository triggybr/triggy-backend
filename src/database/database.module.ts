import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Webhook, WebhookSchema } from '../modules/webhooks/schemas/webhook.schema';
import { User, UserSchema } from '../modules/user/schemas/user.schema';
import { WebhookSeeder } from './seeders/webhook.seeder';
import { UserSeeder } from './seeders/user.seeder';

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
    ]),
  ],
  providers: [WebhookSeeder, UserSeeder]
})
export class DatabaseModule {}
