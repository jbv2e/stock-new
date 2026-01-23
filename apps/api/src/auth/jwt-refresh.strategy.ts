import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from '../users/users.service';

const refreshCookieExtractor = (req: Request): string | null => {
  if (!req?.headers?.cookie) {
    return null;
  }

  const cookies = req.headers.cookie.split(';');
  const refreshCookie = cookies
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('refresh_token='));

  if (!refreshCookie) {
    return null;
  }

  return refreshCookie.split('=')[1];
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([refreshCookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
    if (user.status === 'suspended') {
      throw new UnauthorizedException('정지된 계정입니다.');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogout: user.lastLogout,
    };
  }
}
