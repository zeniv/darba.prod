import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIntegrationDto {
  @ApiProperty({
    description: 'Тип интеграции',
    enum: ['ai_key'],
  })
  @IsEnum(['ai_key'])
  type: string;

  @ApiProperty({
    description: 'Провайдер',
    enum: ['openai', 'anthropic', 'stability', 'elevenlabs', 'runwayml', 'did'],
  })
  @IsString()
  provider: string;

  @ApiProperty({ description: 'API-ключ (будет зашифрован)' })
  @IsString()
  apiKey: string;
}
