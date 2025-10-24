import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserIntegration, UserIntegrationDocument } from '../../modules/integrations/schemas/user-integration.schema';

@Injectable()
export class UserIntegrationSeeder implements OnModuleInit {
    constructor(
        @InjectModel(UserIntegration.name) private readonly userIntegrationModel: Model<UserIntegrationDocument>,
    ) { }

    async onModuleInit() {
        await this.seed();
    }

    async seed() {
        const count = await this.userIntegrationModel.countDocuments();

        if (count === 0) {
            console.log('Seeding user integrations...');
            const userIntegrations: Partial<UserIntegration>[] = [
                {
                    id: '969ced6c-2a9c-4959-ac76-571356a7a206',
                    userId: '2d7ee183-eda7-452f-a8c8-ba2f3c67ea97',
                    userStatsId: 'stats_123',
                    urlCode: 'abc123xyz',
                    name: 'Hotmart → AstroMembers (Criar Membro)',
                    source: {
                        platform: 'hotmart',
                        event: 'PURCHASE_APPROVED',
                        eventDescription: 'Quando uma compra é aprovada',
                    },
                    destination: {
                        platform: 'astromembers',
                        name: 'AstroMembers',
                        action: 'create_member',
                        actionDescription: 'Cria um novo membro na plataforma',
                        additionalFields: [
                            { name: 'url', value: 'https://api.astromembers.com' },
                            { name: 'api_key', value: 'sk_test_123456789' },
                        ],
                    },
                    status: { value: 'ACTIVE', label: 'Ativa' },
                    successCount: 45,
                    errorCount: 2,
                    lastTriggered: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: '53dd05e3-b1c2-497a-a92a-7401278b0de4',
                    userId: '2d7ee183-eda7-452f-a8c8-ba2f3c67ea97',
                    userStatsId: 'stats_123',
                    urlCode: 'def456uvw',
                    name: 'Hotmart → Discord (Enviar Mensagem)',
                    source: {
                        platform: 'hotmart',
                        name: 'Hotmart',
                        event: 'PURCHASE_APPROVED',
                        eventDescription: 'Quando uma compra é aprovada',
                    },
                    destination: {
                        platform: 'discord',
                        name: 'Discord',
                        action: 'send_message',
                        actionDescription: 'Envia mensagem para um canal do Discord',
                        additionalFields: [
                            { name: 'url', value: 'https://discord.com/api/webhooks/123456789/abcdefghijk' },
                            { name: 'api_key', value: 'discord_bot_token_123' },
                        ],
                    },
                    status: { value: 'ACTIVE', label: 'Ativa' },
                    successCount: 32,
                    errorCount: 5,
                    lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: '1a81e229-94b5-4be1-961c-f076db5c0afb',
                    userId: '2d7ee183-eda7-452f-a8c8-ba2f3c67ea97',
                    userStatsId: 'stats_123',
                    urlCode: 'ghi789rst',
                    name: 'Hotmart → AstroMembers (Remover Membro)',
                    source: {
                        platform: 'hotmart',
                        name: 'Hotmart',
                        event: 'PURCHASE_REFUNDED',
                        eventDescription: 'Quando uma compra é reembolsada',
                    },
                    destination: {
                        platform: 'astromembers',
                        name: 'AstroMembers',
                        action: 'remove_member',
                        actionDescription: 'Remove o acesso do membro na plataforma',
                        additionalFields: [
                            { name: 'url', value: 'https://api.astromembers.com' },
                            { name: 'api_key', value: 'sk_test_123456789' },
                        ],
                    },
                    status: { value: 'ACTIVE', label: 'Ativa' },
                    successCount: 8,
                    errorCount: 0,
                    lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: 'f17a8289-811b-4f52-8581-df517d7e43f1',
                    userId: '2d7ee183-eda7-452f-a8c8-ba2f3c67ea97',
                    userStatsId: 'stats_123',
                    urlCode: 'jkl101mno',
                    name: 'Hotmart → Discord (Adicionar Cargo)',
                    source: {
                        platform: 'hotmart',
                        name: 'Hotmart',
                        event: 'PURCHASE_APPROVED',
                        eventDescription: 'Quando uma compra é aprovada',
                    },
                    destination: {
                        platform: 'discord',
                        name: 'Discord',
                        action: 'add_role',
                        actionDescription: 'Adiciona cargo ao usuário',
                        additionalFields: [
                            { name: 'url', value: 'https://discord.com/api/webhooks/987654321/zyxwvutsrqp' },
                            { name: 'api_key', value: 'discord_bot_token_456' },
                        ],
                    },
                    status: { value: 'INACTIVE', label: 'Inativa' },
                    successCount: 15,
                    errorCount: 3,
                    lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
                    updatedAt: new Date().toISOString(),
                },
            ];

            await this.userIntegrationModel.insertMany(userIntegrations);
            console.log('User integrations seeded successfully!');
        } else {
            console.log('User integrations already seeded, skipping...');
        }
    }

    async clear() {
        await this.userIntegrationModel.deleteMany({});
    }
}

