import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

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
  constructor() {
    super({
      // jwtFromRequest: ExtractJwt.fromExtractors([
      //   (req) => req?.cookies?.access_token ?? null,
      // ]),
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
      // passReqToCallback: false,
    });
  }

  async validate(payload: any) {
    // console.log('validate')
    return { userId: payload.sub, email: payload.email };
  }
}
