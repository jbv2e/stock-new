import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async findByProviderId(providerId: string) {
    return this.users.findOne({ where: { providerId } });
  }

  async findById(id: string) {
    return this.users.findOne({ where: { id } });
  }

  async findAll() {
    return this.users.find();
  }

  async create(profile: Partial<User>): Promise<User> {
    const user = this.users.create(profile);
    return this.users.save(user);
  }

  async existsAdmin(): Promise<boolean> {
    const count = await this.users.count({ where: { role: 'admin' } });
    return count > 0;
  }

  async promoteToAdmin(id: string) {
    await this.users.update(id, { role: 'admin', status: 'active' });
    return this.findById(id);
  }

  async remove(id: string) {
    await this.users.delete(id);
  }

  async updateStatus(id: string, status: User['status']) {
    await this.users.update(id, { status });
    return this.findById(id);
  }

  async updateLoginLog(id: string, lastLogin: Date) {
    await this.users.update(id, { lastLogin });
  }

  async updateLogoutLog(id: string, lastLogout: Date) {
    await this.users.update(id, { lastLogout });
  }
}
