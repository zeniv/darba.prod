import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Текст комментария' })
  @IsString()
  content: string;
}

export class CreateDonationDto {
  @ApiProperty({ description: 'ID получателя' })
  @IsString()
  recipientId: string;

  @ApiProperty({ description: 'Сумма (в токенах)', minimum: 1 })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ description: 'Сообщение' })
  @IsString()
  @IsOptional()
  message?: string;
}
