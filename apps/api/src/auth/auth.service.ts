import { Injectable } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwt: JwtService,
  ) {}

  async validateGoogleUser(profile: any): Promise<User> {
    const { id, displayName, emails, photos } = profile;

    let user = await this.userService.findByProviderId(id);

    if (!user) {
      user = await this.userService.create({
        provider: 'google',
        providerId: id,
        email: emails[0].value,
        name: displayName,
        picture: photos?.[0]?.value ?? null,
      });
    }

    return user;
  }

  generateTokens(user: User) {
    // JWT 페이로드에 역할/상태를 함께 담아 클라이언트가 참고 가능
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogout: user.lastLogout ?? null,
    };

    // 액세스/리프레시 토큰을 분리된 시크릿과 만료시간으로 발급
    const accessSecret = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET!;
    const refreshSecret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET!;
    // env 문자열을 JWT 타입에 맞게 캐스팅
    const accessExpiresIn =
      (process.env.JWT_ACCESS_EXPIRES_IN ?? '1h') as StringValue | number;
    const refreshExpiresIn =
      (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as StringValue | number;

    return {
      accessToken: this.jwt.sign(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      refreshToken: this.jwt.sign(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    };
  }

  async recordLogin(userId: string) {
    await this.userService.updateLoginLog(userId, new Date());
  }

  async recordLogout(userId: string) {
    await this.userService.updateLogoutLog(userId, new Date());
  }

  async findUserById(id: string) {
    return this.userService.findById(id);
  }
}
