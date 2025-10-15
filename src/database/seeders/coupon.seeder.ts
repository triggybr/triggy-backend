import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from '../../modules/checkout/schemas/coupon.schema';

@Injectable()
export class CouponSeeder implements OnModuleInit {
    constructor(
        @InjectModel(Coupon.name) private readonly couponModel: Model<CouponDocument>,
    ) { }

    async onModuleInit() {
        await this.seed();
    }

    async seed() {
        const environment = process.env.ENVIRONMENT || 'dev';

        if (environment == 'production') {
            console.log('Skipping integration seeding in non-development environment');
            return;
        }

        const count = await this.couponModel.countDocuments();

        if (count === 0) {
            console.log('Seeding coupons...');
            const coupons: Partial<Coupon>[] = [
                {
                    id: 'coupon_001',
                    code: 'WELCOME10',
                    discount: 10,
                    type: 'PERCENT',
                    description: 'Cupom de boas-vindas - 10% de desconto',
                    valid: true,
                },
                {
                    id: 'coupon_002',
                    code: 'SAVE20',
                    discount: 20,
                    type: 'PERCENT',
                    description: 'Economia de 20% em qualquer plano',
                    valid: true,
                },
                {
                    id: 'coupon_003',
                    code: 'FIXED50',
                    discount: 50,
                    type: 'FIXED',
                    description: 'R$ 50 de desconto',
                    valid: true,
                },
                {
                    id: 'coupon_004',
                    code: 'BLACKFRIDAY',
                    discount: 30,
                    type: 'PERCENT',
                    description: 'Black Friday - 30% OFF',
                    valid: false,
                },
            ];

            await this.couponModel.insertMany(coupons);
            console.log('Coupons seeded successfully!');
        } else {
            console.log('Coupons already seeded, skipping...');
        }
    }

    async clear() {
        await this.couponModel.deleteMany({});
    }
}

