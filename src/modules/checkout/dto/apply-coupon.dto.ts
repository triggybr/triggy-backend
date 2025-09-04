import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty({ description: 'The coupon code to apply.', example: 'PROMO10' })
  @IsString()
  @IsNotEmpty()
  couponCode: string;

  @ApiProperty({ description: 'The ID of the plan to apply the coupon to.' })
  @IsString()
  @IsNotEmpty()
  planId: string;
} 