import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { Public } from '../auth/public.decorator';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Все активные тарифы' })
  async findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Тариф по ID' })
  async findById(@Param('id') id: string) {
    return this.plansService.findById(id);
  }
}
