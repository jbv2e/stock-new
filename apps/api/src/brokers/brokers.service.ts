// src/brokers/brokers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BrokerAdapter,
  BrokerType,
  GetBalanceResult,
  PlaceOrderParams,
  PlaceOrderResult,
} from './interfaces/broker-adapter.interface';
import { KisBrokerAdapter } from './adapters/kis-broker.adapter';

// 어댑터들을 한 곳에서 관리

@Injectable()
export class BrokersService {
  private readonly adapters = new Map<BrokerType, BrokerAdapter>();

  constructor(
    private readonly kisBrokerAdapter: KisBrokerAdapter,
    // 미래에셋 추가 시: private readonly miraeBrokerAdapter: MiraeBrokerAdapter,
  ) {
    this.adapters.set(this.kisBrokerAdapter.type, this.kisBrokerAdapter);
    // this.adapters.set(this.miraeBrokerAdapter.type, this.miraeBrokerAdapter);
  }

  private getAdapter(type: BrokerType): BrokerAdapter {
    const adapter = this.adapters.get(type);
    if (!adapter) {
      throw new NotFoundException(`Unsupported broker type: ${type}`);
    }
    return adapter;
  }

  async getBalance(type: BrokerType, userId: string): Promise<GetBalanceResult> {
    const adapter = this.getAdapter(type);
    return adapter.getBalance(userId);
  }

  async placeOrder(
    type: BrokerType,
    params: PlaceOrderParams,
  ): Promise<PlaceOrderResult> {
    const adapter = this.getAdapter(type);
    return adapter.placeOrder(params);
  }
}
