import { Body, Controller, HttpCode, HttpStatus, Logger, Post, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { CheckoutService } from './checkout.service';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { ActiveUserExternalId } from 'src/common/decorators/active-user-id.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ConfirmPaymentDto } from './dto/webhook.dto';
import { ApplyCouponResponseDto, ProcessPaymentResponseDto } from './dto/checkout-responses.dto';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name)

  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('apply-coupon')
  @ApiOperation({ summary: 'Aplicar cupom de desconto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cupom processado com sucesso.',
    type: ApplyCouponResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Cupom inválido ou dados incorretos.',
    type: ApplyCouponResponseDto
  })
  @HttpCode(HttpStatus.OK)
  async applyCoupon(@Body() dto: ApplyCouponDto): Promise<ApplyCouponResponseDto> {
    try {
      return this.checkoutService.applyCoupon(dto);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Post('process-payment')
  @ApiOperation({ summary: 'Processar pagamento da assinatura' })
  @ApiResponse({ 
    status: 200, 
    description: 'Pagamento processado com sucesso.',
    type: ProcessPaymentResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados de pagamento inválidos.',
    type: ProcessPaymentResponseDto
  })
  @ApiResponse({ 
    status: 402, 
    description: 'Pagamento recusado.',
    type: ProcessPaymentResponseDto
  })
  @HttpCode(HttpStatus.OK)
  async processPayment(@ActiveUserExternalId() externalId: string, @Body() dto: ProcessPaymentDto, @Req() req: Request): Promise<ProcessPaymentResponseDto> {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || '0.0.0.0';
      return this.checkoutService.processPayment(externalId, dto, clientIp);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Post('confirm-payment')
  @ApiOperation({ summary: 'Confirmar pagamento a partir de webhook' })
  @ApiResponse({ status: 200, description: 'Confirmação de pagamento recebida.' })
  @Public()
  @HttpCode(HttpStatus.OK)
  async confirmPayment(@Body() dto: ConfirmPaymentDto) {
    this.checkoutService.confirmPayment(dto);
  }
} 