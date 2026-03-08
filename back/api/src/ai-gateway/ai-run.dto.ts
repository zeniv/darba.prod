import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiRunDto {
  @ApiProperty({ description: 'Тип агента', example: 'chat' })
  @IsString()
  agentType: string;

  @ApiPropertyOptional({ description: 'Провайдер', example: 'anthropic' })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({ description: 'Модель', example: 'claude-opus-4-6' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ description: 'Параметры задачи' })
  @IsObject()
  params: Record<string, any>;
}
