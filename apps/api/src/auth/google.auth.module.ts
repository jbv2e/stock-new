import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "users/users.module";
import { AuthModule } from './auth.module';  
import { GoogleStrategy } from "./google.strategy";
import { Module } from "@nestjs/common";
import { GoogleAuthController } from "./google.auth.controller";


@Module({
  imports: [
    UsersModule,
    AuthModule,
    PassportModule.register({ defaultStrategy: 'google' }),
  ],
  providers: [GoogleStrategy],
  controllers: [GoogleAuthController],
})
export class GoogleAuthModule {}
