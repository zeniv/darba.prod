import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateTicketDto, AddMessageDto } from './dto/create-ticket.dto';

@ApiTags('Support')
@Controller('support')
@ApiBearerAuth()
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Создать тикет в поддержку' })
  async createTicket(@Req() req: any, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(
      req.user.userId,
      dto.subject,
      dto.message,
      dto.priority,
    );
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Мои тикеты' })
  async myTickets(@Req() req: any) {
    return this.supportService.getUserTickets(req.user.userId);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Тикет с сообщениями' })
  async getTicket(@Param('id') id: string, @Req() req: any) {
    return this.supportService.getTicket(id, req.user.userId);
  }

  @Post('tickets/:id/messages')
  @ApiOperation({ summary: 'Добавить сообщение в тикет' })
  async addMessage(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: AddMessageDto,
  ) {
    return this.supportService.addMessage(id, req.user.userId, dto.content);
  }
}
