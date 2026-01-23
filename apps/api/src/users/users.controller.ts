import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  // 관리자 존재 여부 확인 (최초 세팅 여부를 프런트에서 표시)
  @Get('admin/exists')
  async adminExists() {
    const hasAdmin = await this.userService.existsAdmin();
    return { exists: hasAdmin };
  }

  // 첫 관리자 부트스트랩: 로그인된 사용자(구글 등) 자신을 관리자 승격
  // 관리자 계정이 하나도 없을 때만 허용
  @Post('admin/bootstrap/self')
  @UseGuards(AuthGuard('jwt'))
  async bootstrapAdminSelf(@Req() req: any) {
    const hasAdmin = await this.userService.existsAdmin();
    if (hasAdmin) {
      throw new ForbiddenException('이미 관리자 계정이 존재합니다.');
    }
    const promoted = await this.userService.promoteToAdmin(req.user.userId);
    return promoted;
  }

  // 관리자: 상태/로그 확인
  @Get(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getStatus(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return {
      id: user?.id,
      status: user?.status,
      lastLogin: user?.lastLogin,
      lastLogout: user?.lastLogout,
    };
  }

  // 관리자: 사용자 생성
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async createUser(
    @Body()
    body: {
      provider: string;
      providerId: string;
      email: string;
      name: string;
      role?: 'user' | 'admin';
      status?: 'active' | 'suspended';
      picture?: string | null;
    },
  ) {
    return this.userService.create({
      provider: body.provider,
      providerId: body.providerId,
      email: body.email,
      name: body.name,
      role: body.role ?? 'user',
      status: body.status ?? 'active',
      picture: body.picture ?? null,
    });
  }

  // 관리자: 사용자 삭제
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async removeUser(@Param('id') id: string) {
    await this.userService.remove(id);
    return { message: 'deleted' };
  }

  // 관리자: 로그인/로그아웃 기록 확인
  @Get(':id/logs')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getUserLogs(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return {
      id: user?.id,
      lastLogin: user?.lastLogin,
      lastLogout: user?.lastLogout,
    };
  }

  // 관리자: 전체 사용자 목록 조회
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getAllUsers(@Query('q') q?: string) {
    const users = await this.userService.findAll();
    if (!q) return users;
    const keyword = q.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(keyword) ||
        u.name.toLowerCase().includes(keyword),
    );
  }

  // 내 계정의 최근 로그아웃 시간 확인
  @Get('me/logout')
  @UseGuards(AuthGuard('jwt'))
  async myLastLogout(@Req() req: any) {
    const user = await this.userService.findById(req.user.userId);
    return { lastLogout: user?.lastLogout ?? null };
  }
}
