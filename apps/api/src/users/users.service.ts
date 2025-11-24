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

  async create(profile: Partial<User>): Promise<User> {
    const user = this.users.create(profile);
    return this.users.save(user);
  }
}
