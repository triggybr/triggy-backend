import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { uuidGenerator } from 'src/common/utils/uuid-generator';
import { UserStats, UserStatsDocument } from '../integrations/schemas/user-stats.schema';
import { User, UserDocument } from './schemas/user.schema';

interface CreateUserFromClerkData {
  externalId: string;
  email: string;
}

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name)

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserStats.name) private readonly userStatsModel: Model<UserStatsDocument>,
  ) {}

  async createFromClerkWebhook(userData: CreateUserFromClerkData) {
    try {
      const existingUser = await this.userModel.findOne({
        $or: [
          { externalId: userData.externalId },
          { email: userData.email }
        ]
      }).lean();
  
      if (existingUser) {
        this.logger.error('User already exists', {
          externalId: userData.externalId,
          email: userData.email,
        });
        return;
      }
  
      const now = new Date().toISOString()
  
      const user = await this.userModel.create({
        id: uuidGenerator(),
        externalId: userData.externalId,
        email: userData.email,
        createdAt: now,
        updatedAt: now,
      });
  
      await this.userStatsModel.create({
        id: uuidGenerator(),
        userId: user.id,
        usedWebhookQuota: 0,
        usedIntegrationQuota: 0,
      });
    } catch (error) {
      this.logger.error('Error creating user', {
        externalId: userData.externalId,
        email: userData.email,
        error,
      });
    }
  }
} 