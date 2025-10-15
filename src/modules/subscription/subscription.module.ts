import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { Order, OrderSchema } from '../checkout/schemas/order.schema';
import { Plan, PlanSchema } from '../plans/schemas/plan.schema';
import { Signature, SignatureSchema } from '../user/schemas/signature.schema';
import { User, UserSchema } from '../user/schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: Plan.name, schema: PlanSchema },
            { name: Signature.name, schema: SignatureSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [SubscriptionController],
    providers: [SubscriptionService],
    exports: [SubscriptionService],
})
export class SubscriptionModule { }

