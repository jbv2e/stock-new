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
    
    // console.log('[JWT_SECRET]', process.env.JWT_SECRET);

    const payload = { sub: user.id, email: user.email };

    // return {
    //   accessToken: this.jwt.sign(payload, { expiresIn: '1h' }),
    //   refreshToken: this.jwt.sign(payload, { expiresIn: '7d' }),
    // };
    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(payload, { expiresIn: '7d' }),
    };
  }
}
