import { Module, OnModuleInit } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';

@Module({
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule implements OnModuleInit {
  constructor(private plansService: PlansService) {}

  async onModuleInit() {
    await this.plansService.seedDefaults();
  }
}
