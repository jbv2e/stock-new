// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

// @Module({
//   imports: [],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { ConfigModule } from '@nestjs/config';
import { GoogleAuthModule } from 'auth/google.auth.module';
import { BrokersModule } from 'brokers/brokers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3', 
      database: 'db.sqlite',
      entities: [User],
      synchronize: true,
    }),
    UsersModule,
    GoogleAuthModule,
    AuthModule,
    BrokersModule
  ],
})
export class AppModule {}
