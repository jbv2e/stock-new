// src/brokers/interfaces/broker-adapter.interface.ts
export type BrokerType = 'KIS' | 'MIRAE' | 'SAMSUNG'; // 필요시 확장

export interface GetBalanceResult {
  cash: number;
  stocks: Array<{
    symbol: string;
    quantity: number;
    avgPrice: number;
  }>;
}

export interface PlaceOrderParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price?: number; // 시장가면 optional
  userId: string; // 사용자별 계좌/토큰 찾을 때 사용
}

export interface PlaceOrderResult {
  orderId: string;
  status: 'ACCEPTED' | 'REJECTED' | 'PENDING';
  message?: string;
}

export interface BrokerAdapter {
  /** 이 어댑터가 담당하는 증권사 타입 */
  readonly type: BrokerType;

  /** 사용자별 잔고 조회 */
  getBalance(userId: string): Promise<GetBalanceResult>;

  /** 주문 */
  placeOrder(params: PlaceOrderParams): Promise<PlaceOrderResult>;

  /** 추후 추가: 현재가, 호가, 체결, 잔고 실시간 등 */
  // subscribePrice(...): Promise<...>;
}
