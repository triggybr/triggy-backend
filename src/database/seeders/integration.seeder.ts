import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Integration, IntegrationDocument } from '../../modules/integrations/schemas/integration.schema';

@Injectable()
export class IntegrationSeeder implements OnModuleInit {
  constructor(
    @InjectModel(Integration.name) private readonly integrationModel: Model<IntegrationDocument>,
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

    const count = await this.integrationModel.countDocuments();

    if (count === 0) {
      console.log('Seeding integrations...');
      const integrations: Partial<Integration>[] = [
        {
          id: '28c03cd7-6243-4779-a63a-a9595c817541',
          platform: 'lastlink',
          name: 'LastLink',
          description: 'Integração com a plataforma LastLink para recebimento de webhooks',
          events: [
            {
              name: 'abandoned.cart',
              description: 'Quando uma compra é abandonada',
              destinations: [
                {
                  platform: 'astronmembers',
                  name: 'AstronMembers',
                  additionalFields: ['url'],
                  description: 'AstronMembers',
                  actions: [
                    {
                      name: 'create.product',
                      description: 'Cria um novo produto na plataforma'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];

      await this.integrationModel.insertMany(integrations);
      console.log('Integrations seeded successfully!');
    } else {
      console.log('Integrations already seeded, skipping...');
    }
  }

  async clear() {
    await this.integrationModel.deleteMany({});
  }
}
