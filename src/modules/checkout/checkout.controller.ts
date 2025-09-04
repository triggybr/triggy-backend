import { Body, Controller, HttpCode, HttpStatus, Logger, Post, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { CheckoutService } from './checkout.service';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { ActiveUserExternalId } from 'src/common/decorators/active-user-id.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ConfirmPaymentDto } from './dto/webhook.dto';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name)

  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('apply-coupon')
  @ApiOperation({ summary: 'Apply a coupon to a plan' })
  @ApiResponse({ status: 200, description: 'Coupon applied successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid coupon or plan.' })
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
  @ApiOperation({ summary: 'Process a payment for a plan' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully.' })
  @ApiResponse({ status: 400, description: 'Payment failed.' })
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
  @ApiOperation({ summary: 'Confirm a payment from a webhook' })
  @ApiResponse({ status: 200, description: 'Payment confirmation received.' })
  @Public()
  @HttpCode(HttpStatus.OK)
  async confirmPayment(@Body() dto: ConfirmPaymentDto) {
    this.checkoutService.confirmPayment(dto);
  }
} 