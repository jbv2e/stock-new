import { Injectable } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
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

    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(payload, { expiresIn: '7d' }),
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
