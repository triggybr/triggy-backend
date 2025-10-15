import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../modules/user/schemas/user.schema';
import { UserStats, UserStatsDocument } from 'src/modules/integrations/schemas/user-stats.schema';

@Injectable()
export class UserSeeder implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserStats.name) private readonly userStatsModel: Model<UserStatsDocument>,
  ) { }

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const environment = process.env.ENVIRONMENT || 'staging';
    if (environment == 'production') {
      console.log('Skipping integration seeding in non-development environment');
      return;
    }

    const count = await this.userModel.countDocuments();

    if (count === 0) {
      console.log('Seeding users...');
      const users: Partial<User>[] = [
        {
          id: 'user_123',
          externalId: 'user_123',
          email: 'admin@example.com',
          document: {
            type: 'CPF',
            document: '123.456.789-00',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      const userStats: Partial<UserStats>[] = [
        {
          id: 'stats_123',
          userId: 'user_123',
          usedWebhookQuota: 0,
          usedIntegrationQuota: 0,
        },
      ];

      await this.userModel.insertMany(users);
      await this.userStatsModel.insertMany(userStats);
      console.log('Users seeded successfully!');
    } else {
      console.log('Users already seeded, skipping...');
    }
  }

  async clear() {
    await this.userModel.deleteMany({});
  }
}
