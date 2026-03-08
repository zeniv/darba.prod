import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID тарифного плана' })
  @IsString()
  planId: string;

  @ApiPropertyOptional({
    description: 'Платёжный провайдер',
    enum: ['yookassa', 'stripe'],
    default: 'yookassa',
  })
  @IsEnum(['yookassa', 'stripe'])
  @IsOptional()
  provider?: 'yookassa' | 'stripe';

  @ApiPropertyOptional({ description: 'URL для возврата после оплаты' })
  @IsString()
  @IsOptional()
  returnUrl?: string;
}
