import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorCodes } from 'src/common/codes';
import { uuidGenerator } from 'src/common/utils/uuid-generator';
import { AsaasService } from '../asaas/asaas.service';
import { UserStats, UserStatsDocument } from '../integrations/schemas/user-stats.schema';
import { Plan, PlanDocument } from '../plans/schemas/plan.schema';
import { Signature, SignatureDocument } from '../user/schemas/signature.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { ConfirmPaymentDto } from './dto/webhook.dto';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class CheckoutService {
  private logger = new Logger(CheckoutService.name)

  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<CouponDocument>,
    @InjectModel(Plan.name) private readonly planModel: Model<PlanDocument>,
    private readonly asaasService: AsaasService,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Signature.name) private readonly signatureModel: Model<SignatureDocument>,
    @InjectModel(UserStats.name) private readonly userStatsModel: Model<UserStatsDocument>,
  ) { }

  async applyCoupon(input: ApplyCouponDto) {
    const coupon = await this.couponModel.findOne({
      code: input.couponCode.toUpperCase()
    }).lean();

    if (!coupon) {
      throw new NotFoundException({
        message: 'Coupon not found',
        code: ErrorCodes.COUPON_NOT_FOUND,
      });
    }

    if (!coupon.valid) {
      throw new BadRequestException({
        message: 'Invalid coupon',
        code: ErrorCodes.INVALID_COUPON,
      });
    }

    const plan = await this.planModel.findOne({
      id: input.planId
    }).lean();

    if (!plan) {
      throw new NotFoundException({
        message: 'Plan not found',
        code: ErrorCodes.PLAN_NOT_FOUND,
      });
    }

    const discountAmount = coupon.type === 'PERCENT'
      ? Math.round((coupon.discount * plan.priceValue) / 100)
      : coupon.discount;

    const finalPrice = Math.max(0, plan.priceValue - discountAmount);

    return {
      valid: true,
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        type: coupon.type,
        description: coupon.description,
        valid: coupon.valid
      },
      discountAmount,
      finalPrice
    };
  }

  async processPayment(externalId: string, input: ProcessPaymentDto, remoteIp: string) {
    const user = await this.userModel.findOne({ externalId }).lean();

    if (!user) throw new NotFoundException({
      message: 'User not found',
      code: ErrorCodes.USER_NOT_FOUND,
    });

    const plan = await this.planModel.findOne({ id: input.planId }).lean();
    if (!plan) {
      throw new NotFoundException({
        message: 'Plan not found',
        code: ErrorCodes.PLAN_NOT_FOUND
      });
    }

    let discountAmount = 0;
    let coupon;
    if (input.couponCode) {
      coupon = await this.couponModel.findOne({ code: input.couponCode.toUpperCase() }).lean();
      if (!coupon) {
        throw new NotFoundException({
          message: 'Coupon not found',
          code: ErrorCodes.COUPON_NOT_FOUND,
        });
      }

      if (!coupon.valid) {
        throw new BadRequestException({
          message: 'Invalid coupon',
          code: ErrorCodes.INVALID_COUPON,
        });
      }

      discountAmount = coupon.type === 'PERCENT'
        ? Math.round((coupon.discount * plan.priceValue) / 100)
        : coupon.discount;
    }

    const now = new Date().toISOString()

    const existingSignature = await this.signatureModel.findOne({ userId: user.id }).lean();
    if (existingSignature) {
      if (plan.priceValue <= existingSignature.priceValue) {
        throw new BadRequestException({
          message: 'you cant regress from plan',
          code: ErrorCodes.INVALID_PLAN,
        });
      }
      
      if (input.couponCode && existingSignature.planId === plan.id) {
        throw new BadRequestException({
          message: 'Invalid coupon',
          code: ErrorCodes.INVALID_COUPON,
        })
      }

      await this.asaasService.deleteSubscription(existingSignature.externalId);

      const finalPrice = Math.max(0, plan.priceValue - discountAmount);

      const payload = {
        value: finalPrice,
        externalReference: existingSignature.id,
        creditCard: {
          holderName: input.paymentData.cardName,
          number: input.paymentData.cardNumber,
          expiryMonth: input.paymentData.expiryMonth,
          expiryYear: input.paymentData.expiryYear,
          ccv: input.paymentData.cvv,
        },
        creditCardHolderInfo: {
          name: input.customerData.name,
          email: input.customerData.email,
          cpfCnpj: input.customerData.cpfCnpj,
          postalCode: input.customerData.postalCode,
          addressNumber: input.customerData.addressNumber,
          phone: input.customerData.phone,
        },
        remoteIp,
      };
  
      const subscription = await this.asaasService.createSubscriptionWithCreditCard(externalId, payload);
  
      await this.asaasService.updateSubscription({
        id: subscription?.id,
        value: plan.priceValue
      })

      const signatureToUpdate = {
        planId: plan.id,
        last4: input.paymentData.cardNumber.slice(-4),
        couponCode: input.couponCode,
        type: plan.name,
        priceValue: plan.priceValue,
        active: true,
        externalId: subscription?.id,
        webhookQuota: plan.webhookQuota,
        integrationQuota: plan.integrationQuota,
        logViewQuota: plan.logViewQuota,
        updatedAt: now,
      }

      await this.signatureModel.updateOne({ id: existingSignature.id }, signatureToUpdate);

      return {
        success: true,
        message: 'Pagamento processado com sucesso',
      };
    }

    const signature = {
      id: uuidGenerator(),
      userId: user.id,
      planId: plan.id,
      last4: input.paymentData.cardNumber.slice(-4),
      couponCode: input.couponCode,
      type: plan.name,
      priceValue: plan.priceValue,
      active: true,
      webhookQuota: plan.webhookQuota,
      integrationQuota: plan.integrationQuota,
      logViewQuota: plan.logViewQuota,
      createdAt: now,
      updatedAt: now,
    }

    const finalPrice = Math.max(0, plan.priceValue - discountAmount);

    const payload = {
      value: finalPrice,
      externalReference: signature.id,
      creditCard: {
        holderName: input.paymentData.cardName,
        number: input.paymentData.cardNumber,
        expiryMonth: input.paymentData.expiryMonth,
        expiryYear: input.paymentData.expiryYear,
        ccv: input.paymentData.cvv,
      },
      creditCardHolderInfo: {
        name: input.customerData.name,
        email: input.customerData.email,
        cpfCnpj: input.customerData.cpfCnpj,
        postalCode: input.customerData.postalCode,
        addressNumber: input.customerData.addressNumber,
        phone: input.customerData.phone,
      },
      remoteIp,
    };

    const subscription = await this.asaasService.createSubscriptionWithCreditCard(externalId, payload);

    await this.asaasService.updateSubscription({
      id: subscription?.id,
      value: plan.priceValue
    })

    signature['externalId'] = subscription?.id,
      await this.signatureModel.create(signature);

    return {
      success: true,
      message: 'Pagamento processado com sucesso',
    };
  }

  async confirmPayment(dto: ConfirmPaymentDto) {
    try {
      const signature = await this.signatureModel.findOne({ externalId: dto.payment.subscription }).lean();

      if (!signature) {
        this.logger.error('Signature not found')
        return
      }

      const plan = await this.planModel.findOne({ id: signature.planId }).lean();
      if (!plan) {
        this.logger.error('Plan not found')
        return
      }

      const userStats = await this.userStatsModel.findOne({ userId: signature.userId }).lean();
      if (!userStats) {
        this.logger.error('UserStats not found')
        return
      }

      const orderCreatedDate = dto.dateCreated.split(' ')[0];
      const signatureDate = signature.createdAt.split('T')[0];

      let coupon;
      let discountAmount = 0;
      if (orderCreatedDate === signatureDate && signature.couponCode) {
        coupon = await this.couponModel.findOne({ code: signature.couponCode.toUpperCase() }).lean();
        if (!coupon) {
          this.logger.error('Coupon not found')
          return
        }
        discountAmount = coupon.type === 'PERCENT'
          ? Math.round((coupon.discount * signature.priceValue) / 100)
          : coupon.discount;
      }

      const order = {
        id: uuidGenerator(),
        userId: signature.userId,
        priceValue: signature.priceValue,
        status: 'APPROVED',
        paymentMethod: 'CARD',
        coupon: coupon && {
          code: coupon.code,
          discount: coupon.discount,
          type: coupon.type,
          description: coupon.description,
        },
        discountValue: discountAmount,
      }

      const now = new Date().toISOString()

      order['externalId'] = dto.payment.id,
      order['approvedAt'] = now,
      order['createdAt'] = now,
      order['updatedAt'] = now,

      await this.orderModel.create(order);

      const newDate = new Date();
      newDate.setMonth(newDate.getMonth() + 1);

      await this.signatureModel.updateOne({ id: signature.id }, {
        nextBillingDate: newDate.toISOString(),
        webhookQuota: plan.webhookQuota,
        integrationQuota: plan.integrationQuota,
        logViewQuota: plan.logViewQuota,
      })

      await this.userStatsModel.updateOne({ id: userStats.id }, {
        usedWebhookQuota: 0,
        usedIntegrationQuota: 0,
      });
    } catch (error) {
      this.logger.error(error)
    }
  }
}