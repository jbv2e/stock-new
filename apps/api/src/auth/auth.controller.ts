import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type Request, type Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { cookieOptions } from './cookie.options';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Req() req: Request) {
    return req.user;
  }

  // jwt 재발급 추가
  @Get('refresh')
  @UseGuards(AuthGuard('jwt-refresh')) // refresh 전용 strategy 추천
  async refresh(@Req() req: Request, @Res() res: Response) {
    const currentUser = await this.authService.findUserById((req.user as any).userId);
    const tokens = this.authService.generateTokens(currentUser!);

    res.cookie('access_token', tokens.accessToken, cookieOptions());
    res.cookie(
      'refresh_token',
      tokens.refreshToken,
      cookieOptions({ maxAge: 7 * 24 * 60 * 60 * 1000 }),
    );

    return tokens;
  }

  // JWT 인증 후 로그아웃 처리 + 최근 로그아웃 기록 저장
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: Request, @Res() res: Response) {
    const options = cookieOptions();
    res.clearCookie('access_token', options);
    res.clearCookie('refresh_token', options);
    await this.authService.recordLogout((req.user as any).userId);
    return res.send({ message: 'Logged out' });
  }
}
