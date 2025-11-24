// src/brokers/brokers.module.ts
import { Module } from '@nestjs/common';
import { BrokersService } from './brokers.service';
import { KisBrokerAdapter } from './adapters/kis-broker.adapter';
import { BrokersController } from './brokers.controller';


// BrokersModule – 의존성 묶기

@Module({
  imports: [],
  providers: [BrokersService, KisBrokerAdapter],
  controllers: [BrokersController],
  exports: [BrokersService], // 나중에 전략엔진/알림에서 주입받을 수 있게
})
export class BrokersModule {}
