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
          id: 'hotmart',
          platform: 'hotmart',
          name: 'Hotmart',
          color: 'orange-600',
          description: 'Integração com a plataforma Hotmart para recebimento de webhooks',
          events: [
            {
              name: 'PURCHASE_APPROVED',
              description: 'Quando uma compra é aprovada',
              destinations: [
                {
                  platform: 'astromembers',
                  name: 'AstroMembers',
                  color: 'purple-600',
                  additionalFields: ['url', 'api_key'],
                  description: 'Criar membro na plataforma AstroMembers',
                  actions: [
                    {
                      name: 'create_member',
                      description: 'Cria um novo membro na plataforma'
                    },
                    {
                      name: 'add_tag',
                      description: 'Adiciona uma tag ao membro'
                    }
                  ]
                },
                {
                  platform: 'discord',
                  name: 'Discord',
                  color: 'indigo-500',
                  additionalFields: ['url', 'api_key'],
                  description: 'Envia notificação para o Discord',
                  actions: [
                    {
                      name: 'send_message',
                      description: 'Envia mensagem para um canal do Discord'
                    },
                    {
                      name: 'add_role',
                      description: 'Adiciona cargo ao usuário'
                    }
                  ]
                }
              ]
            },
            {
              name: 'PURCHASE_REFUNDED',
              description: 'Quando uma compra é reembolsada',
              destinations: [
                {
                  platform: 'astromembers',
                  name: 'AstroMembers',
                  color: 'purple-600',
                  additionalFields: ['url', 'api_key'],
                  actions: [
                    {
                      name: 'remove_member',
                      description: 'Remove o acesso do membro na plataforma'
                    },
                    {
                      name: 'remove_tag',
                      description: 'Remove uma tag do membro'
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
