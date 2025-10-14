import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, PlanDocument } from '../../modules/plans/schemas/plan.schema';

@Injectable()
export class PlanSeeder implements OnModuleInit {
  constructor(
    @InjectModel(Plan.name) private readonly planModel: Model<PlanDocument>,
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

    const count = await this.planModel.countDocuments();

    if (count === 0) {
      console.log('Seeding plans...');
      const plans: Partial<Plan>[] = [
        {
          id: 'plan_basic',
          name: 'Básico',
          priceValue: 2990,
          icon: '🚀',
          description: 'Ideal para quem está começando',
          features: [
            'Até 1.000 webhooks/mês',
            '3 integrações ativas',
            'Suporte por e-mail',
            'Documentação da API'
          ],
          popular: false,
          webhookQuota: 1000,
          integrationQuota: 3,
        },
        {
          id: 'plan_pro',
          name: 'Profissional',
          priceValue: 9990,
          icon: '⚡',
          description: 'Para negócios em crescimento',
          features: [
            'Até 10.000 webhooks/mês',
            '10 integrações ativas',
            'Suporte prioritário',
            'Documentação da API',
            'Webhooks em tempo real',
            'Relatórios avançados'
          ],
          popular: true,
          webhookQuota: 10000,
          integrationQuota: 10,
        },
        {
          id: 'plan_enterprise',
          name: 'Empresarial',
          priceValue: 29990,
          icon: '🏢',
          description: 'Solução personalizada para grandes negócios',
          features: [
            'Webhooks ilimitados',
            'Integrações ilimitadas',
            'Suporte 24/7',
            'Documentação da API',
            'Webhooks em tempo real',
            'Relatórios avançados',
            'Conta dedicada',
            'Personalização de endpoints'
          ],
          popular: false,
          webhookQuota: 1000000,
          integrationQuota: 50,
        },
      ];

      await this.planModel.insertMany(plans);
      console.log('Plans seeded successfully!');
    } else {
      console.log('Plans already seeded, skipping...');
    }
  }

  async clear() {
    await this.planModel.deleteMany({});
  }
}
