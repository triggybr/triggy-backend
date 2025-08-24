import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ApplyCouponDto {
  @IsString()
  @IsNotEmpty()
  couponCode: string;

  @IsString()
  @IsNotEmpty()
  planId: string;
} 