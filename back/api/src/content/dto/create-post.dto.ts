import { IsString, IsOptional, IsBoolean, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiPropertyOptional({ description: 'Заголовок' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Текст поста' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'URL медиафайлов', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @ApiPropertyOptional({
    description: 'Тип медиа',
    enum: ['image', 'video', 'audio'],
  })
  @IsEnum(['image', 'video', 'audio'])
  @IsOptional()
  mediaType?: string;

  @ApiPropertyOptional({ description: 'Публичный пост', default: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'ID AI-задачи (если создан из генерации)' })
  @IsString()
  @IsOptional()
  aiTaskId?: string;

  @ApiPropertyOptional({ description: 'Теги', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Опубликовать на стене VK', default: false })
  @IsBoolean()
  @IsOptional()
  shareToVk?: boolean;
}

export class UpdatePostDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
