import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { StockAlert } from './stock-alert.entity';
import { Stock } from './stock.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(StockAlert)
    private readonly alertsRepo: Repository<StockAlert>,
    @InjectRepository(Stock)
    private readonly stocksRepo: Repository<Stock>,
  ) {}

  // 종목 목록 조회 및 검색 (심볼/이름 부분 일치)
  async listStocks(search?: string) {
    if (!search) {
      return this.stocksRepo.find();
    }

    const like = Like(`%${search}%`);
    return this.stocksRepo.find({
      where: [{ symbol: like }, { name: like }],
    });
  }

  // 내 알림 목록
  async listAlerts(userId: string) {
    return this.alertsRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  // 알림 추가 (종목이 없다면 name이 제공될 때만 생성)
  async addAlert(
    userId: string,
    params: { symbol: string; name?: string; direction: 'up' | 'down'; targetPrice: number },
  ) {
    let stock = await this.stocksRepo.findOne({ where: { symbol: params.symbol } });
    if (!stock) {
      if (!params.name) {
        throw new NotFoundException('종목 정보가 없어 name이 필요합니다.');
      }
      stock = await this.stocksRepo.save(
        this.stocksRepo.create({ symbol: params.symbol, name: params.name }),
      );
    }

    const alert = this.alertsRepo.create({
      userId,
      symbol: stock.symbol,
      direction: params.direction,
      targetPrice: params.targetPrice,
    });
    return this.alertsRepo.save(alert);
  }

  // 알림 삭제 (본인 소유만)
  async removeAlert(userId: string, alertId: string) {
    const alert = await this.alertsRepo.findOne({ where: { id: alertId, userId } });
    if (!alert) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }
    await this.alertsRepo.delete(alertId);
    return { message: 'deleted' };
  }
}
