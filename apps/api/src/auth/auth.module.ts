import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
// import { GoogleStrategy } from './google.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

@Module({
  imports: [
    UsersModule,
    // PassportModule.register({ defaultStrategy: 'google' }),
     // 🔶 기본 전략은 jwt
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // jwt 서비스
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: { expiresIn: '1h' },
    // }),
    JwtModule.registerAsync({
      useFactory: () => ({
        // 기본 JWT 설정은 액세스 토큰 기준으로 유지
        secret: process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET,
        signOptions: {
          expiresIn:
            (process.env.JWT_ACCESS_EXPIRES_IN ?? '1h') as StringValue | number,
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
