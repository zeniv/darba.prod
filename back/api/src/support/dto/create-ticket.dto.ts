import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ description: 'Тема обращения' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Текст обращения' })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'Приоритет',
    enum: ['low', 'normal', 'high'],
    default: 'normal',
  })
  @IsEnum(['low', 'normal', 'high'])
  @IsOptional()
  priority?: string;
}

export class AddMessageDto {
  @ApiProperty({ description: 'Текст сообщения' })
  @IsString()
  content: string;
}
