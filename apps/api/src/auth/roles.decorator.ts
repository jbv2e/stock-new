import { SetMetadata } from '@nestjs/common';

// 필요한 역할을 메타데이터로 지정하는 데코레이터 (예: @Roles('admin'))
export const Roles = (...roles: Array<'user' | 'admin'>) => SetMetadata('roles', roles);
