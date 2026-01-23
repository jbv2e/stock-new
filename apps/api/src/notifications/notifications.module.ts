import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { StockAlert } from './stock-alert.entity';
import { Stock } from './stock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockAlert, Stock])],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
