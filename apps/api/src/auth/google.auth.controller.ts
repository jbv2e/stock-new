import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { type Response, type Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { cookieOptions } from './cookie.options';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Guard handles redirect to Google
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const tokens = this.authService.generateTokens(user);

    // 로그인 성공 시 최근 로그인 기록 저장
    await this.authService.recordLogin(user.id);

    res.cookie('access_token', tokens.accessToken, cookieOptions());
    res.cookie(
      'refresh_token',
      tokens.refreshToken,
      cookieOptions({ maxAge: 7 * 24 * 60 * 60 * 1000 }),
    );

    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
}
