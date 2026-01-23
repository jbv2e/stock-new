import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // 종목 전체 목록 조회/검색
  @Get('stocks')
  async listStocks(@Query('q') q?: string) {
    return this.notificationsService.listStocks(q);
  }

  // 내 종목 알림 목록
  @Get('stocks/alerts')
  async myAlerts(@Req() req: any) {
    return this.notificationsService.listAlerts(req.user.userId);
  }

  // 종목 알림 추가 (up/down)
  @Post('stocks/alerts')
  async addAlert(
    @Req() req: any,
    @Body()
    body: { symbol: string; name?: string; direction: 'up' | 'down'; targetPrice: number },
  ) {
    return this.notificationsService.addAlert(req.user.userId, body);
  }

  // 종목 알림 삭제
  @Delete('stocks/alerts/:id')
  async removeAlert(@Req() req: any, @Param('id') id: string) {
    return this.notificationsService.removeAlert(req.user.userId, id);
  }
}
