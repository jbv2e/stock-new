import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  // constructor(private readonly authService: AuthService) {}

  // 1) Google 로그인 페이지로 redirect
  // @Get('google')
  // @UseGuards(AuthGuard('google'))
  // async googleAuth() {
  //   // 여기서는 아무것도 필요 없음. Guard가 redirect 해줌.
  // }

  // // 2) 구글 로그인 callback URL
  // @Get('google/callback')
  // @UseGuards(AuthGuard('google'))
  // async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
  //   const user = req.user;

  //   // JWT 발급
  //   const tokens = this.authService.generateTokens(user as any);

  //   // HttpOnly 쿠키 저장
  //   res.cookie('access_token', tokens.accessToken, {
  //     httpOnly: true,
  //     secure: false, // HTTPS면 true
  //     // sameSite: 'lax',
  //     sameSite: 'none',
  //     path: '/',
  //   });

  //   // 원하는 페이지로 리다이렉트
  //   // return res.redirect(process.env.FRONTEND_URL || 'http://localhost:3001');
  //   return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  // }

  // (옵션) 로그인 상태 확인
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Req() req: Request) {
    return req.user;
  }
}
