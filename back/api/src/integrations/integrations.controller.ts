import { Controller, Post, Get, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';

@ApiTags('Integrations')
@Controller('integrations')
@ApiBearerAuth()
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Post('keys')
  @ApiOperation({ summary: 'Добавить API-ключ провайдера' })
  async addKey(@Req() req: any, @Body() dto: CreateIntegrationDto) {
    await this.integrationsService.addKey(
      req.user.userId,
      dto.type,
      dto.provider,
      dto.apiKey,
    );
    return { ok: true };
  }

  @Get('keys')
  @ApiOperation({ summary: 'Мои API-ключи (без значений)' })
  async listKeys(@Req() req: any) {
    return this.integrationsService.getUserKeys(req.user.userId);
  }

  @Delete('keys/:id')
  @ApiOperation({ summary: 'Удалить API-ключ' })
  async removeKey(@Param('id') id: string, @Req() req: any) {
    await this.integrationsService.removeKey(req.user.userId, id);
    return { ok: true };
  }
}
