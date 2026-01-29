import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from '../users/users.service';

// cookie Extractor
const cookieExtractor = (req: Request): string | null => {
  // console.log(req)

  // let token = null;
  // if (req && req.cookies && req.cookies.access_token) {
  //   token = req.cookies.access_token;
  // }
  // return token;

  if(!req || !req.headers || !req.headers.cookie) {
    return null;
  }

  const cookies = req.headers.cookie.split(';');
  const cookie = cookies.map(v=>v.trim()).find((cookie) => cookie.startsWith('access_token='));
  if(!cookie) {
    return null;
  }

  // console.log(cookie.split('=')[1])
  return cookie.split('=')[1];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      // jwtFromRequest: ExtractJwt.fromExtractors([
      //   (req) => req?.cookies?.access_token ?? null,
      // ]),
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      // 액세스 토큰 검증 전용 시크릿
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET!,
      // passReqToCallback: false,
    });
  }

  async validate(payload: any) {
    // DB에서 최신 상태 조회하여 정지 계정 차단
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
