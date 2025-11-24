// 한투 adapter// src/brokers/adapters/kis-broker.adapter.ts
import { Injectable, Logger } from '@nestjs/common';
import {
  BrokerAdapter,
  BrokerType,
  GetBalanceResult,
  PlaceOrderParams,
  PlaceOrderResult,
} from '../interfaces/broker-adapter.interface';

// 한투 증권 Open API 연동 구현 (더미)

@Injectable()
export class KisBrokerAdapter implements BrokerAdapter {
  readonly type: BrokerType = 'KIS';
  private readonly logger = new Logger(KisBrokerAdapter.name);

  async getBalance(userId: string): Promise<GetBalanceResult> {
    // TODO: userId로 DB에서 KIS 액세스 토큰/계좌번호 조회
    // TODO: 한국투자증권 Open API 호출

    this.logger.log(`getBalance called for user: ${userId}`);

    // 일단은 더미 데이터
    return {
      cash: 1000000,
      stocks: [
        { symbol: '005930', quantity: 10, avgPrice: 70000 },
      ],
    };
  }

  async placeOrder(params: PlaceOrderParams): Promise<PlaceOrderResult> {
    this.logger.log(
      `placeOrder: ${JSON.stringify({
        userId: params.userId,
        symbol: params.symbol,
        side: params.side,
        quantity: params.quantity,
        price: params.price,
      })}`,
    );

    // TODO: KIS 주문 API 호출

    return {
      orderId: 'KIS-ORDER-123456',
      status: 'ACCEPTED',
    };
  }
}
