// src/brokers/brokers.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BrokersService } from './brokers.service';
import { AuthGuard } from '@nestjs/passport';
import { type Request } from 'express';
import { type BrokerType, PlaceOrderParams } from './interfaces/broker-adapter.interface';

// JWT 로그인된 유저 기준으로 증권 계좌/주문 테스트용.

@Controller('brokers')
@UseGuards(AuthGuard('jwt')) // ✅ /auth/me랑 동일하게 JWT 필요
export class BrokersController {
  constructor(private readonly brokersService: BrokersService) {}


  // 잔고 조회: GET http://localhost:3000/brokers/KIS/balance
  // 주문: POST http://localhost:3000/brokers/KIS/order
  // 둘 다 프론트에서 /auth/me 호출할 때와 마찬가지로 쿠키에 있는 access_token 기준으로 동작.

  @Get(':brokerType/balance')
  async getBalance(
    @Param('brokerType') brokerType: BrokerType,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.brokersService.getBalance(brokerType, user.userId);
  }

  @Post(':brokerType/order')
  async placeOrder(
    @Param('brokerType') brokerType: BrokerType,
    @Req() req: Request,
    @Body() body: Omit<PlaceOrderParams, 'userId'>,
  ) {
    const user = req.user as any;
    return this.brokersService.placeOrder(brokerType, {
      ...body,
      userId: user.userId,
    });
  }
}
