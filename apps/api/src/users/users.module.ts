import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, RolesGuard],
  controllers: [UsersController],
  exports: [UserService]
})
export class UsersModule {}
