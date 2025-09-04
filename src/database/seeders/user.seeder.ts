import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../modules/user/schemas/user.schema';

@Injectable()
export class UserSeeder implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
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
        }
      ];

      await this.userModel.insertMany(users);
      console.log('Users seeded successfully!');
    } else {
      console.log('Users already seeded, skipping...');
    }
  }

  async clear() {
    await this.userModel.deleteMany({});
  }
}
