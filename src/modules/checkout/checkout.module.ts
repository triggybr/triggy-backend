import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { Coupon, CouponSchema } from './schemas/coupon.schema';
import { Plan, PlanSchema } from '../plans/schemas/plan.schema';
import { AsaasModule } from '../asaas/asaas.module';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Signature, SignatureSchema } from '../user/schemas/signature.schema';
import { UserStats, UserStatsSchema } from '../integrations/schemas/user-stats.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: User.name, schema: UserSchema },
      { name: Signature.name, schema: SignatureSchema },
      { name: UserStats.name, schema: UserStatsSchema },
    ]),
    AsaasModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {} 