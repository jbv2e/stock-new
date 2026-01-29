import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type Request, type Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { accessCookieOptions, refreshCookieOptions } from './cookie.options';

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
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const currentUser = await this.authService.findUserById((req.user as any).userId);
    const tokens = this.authService.generateTokens(currentUser!);

    res.cookie('access_token', tokens.accessToken, accessCookieOptions());
    res.cookie(
      'refresh_token',
      tokens.refreshToken,
      refreshCookieOptions(),
    );
    console.log(tokens)
     //res.status(200).json(tokens);
    return tokens; // @Res() 쓰면 Nest가 자동 응답 안 함
  }

  // JWT 인증 후 로그아웃 처리 + 최근 로그아웃 기록 저장
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: Request, @Res() res: Response) {
    res.clearCookie('access_token', accessCookieOptions());
    res.clearCookie('refresh_token', refreshCookieOptions());
    await this.authService.recordLogout((req.user as any).userId);
    return res.send({ message: 'Logged out' });
  }
}
