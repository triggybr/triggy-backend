import { Body, Controller, HttpCode, HttpStatus, Logger, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CheckoutService } from './checkout.service';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { ActiveUserExternalId } from 'src/common/decorators/active-user-id.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ConfirmPaymentDto } from './dto/webhook.dto';

@Controller('checkout')
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name)

  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('apply-coupon')
  @HttpCode(HttpStatus.OK)
  async applyCoupon(@Body() dto: ApplyCouponDto) {
    try {
      return this.checkoutService.applyCoupon(dto);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Post('process-payment')
  @HttpCode(HttpStatus.OK)
  async processPayment(@ActiveUserExternalId() externalId: string, @Body() dto: ProcessPaymentDto, @Req() req: Request) {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || '0.0.0.0';
      await this.checkoutService.processPayment(externalId, dto, clientIp);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Post('confirm-payment')
  @Public()
  @HttpCode(HttpStatus.OK)
  async confirmPayment(@Body() dto: ConfirmPaymentDto) {
    this.checkoutService.confirmPayment(dto);
  }
} 