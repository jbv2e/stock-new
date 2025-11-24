import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { type Response, type Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly authService: AuthService) {}

  // 1) 구글 로그인 시작
  @Get()
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // 이 라우트는 Google 로그인 URL로 redirect됨
  }

  // 2) 구글 로그인 콜백
  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // GoogleStrategy.validate() 에서 user 객체 반환됨
    const user = req.user as any;

    // JWT 발급
    const tokens = this.authService.generateTokens(user);

    const isProd = process.env.NODE_ENV === 'production';


    // HttpOnly 쿠키로 access_token 설정
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,       // ⚠ 로컬 개발용 : false
      sameSite: isProd ? 'none' : 'lax',     // ⚠ 로컬 개발용 : lax
      // secure:  true,       // product
      // sameSite: 'none',     // product
      path: '/',
    });

    // 프론트엔드로 redirect
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
}
