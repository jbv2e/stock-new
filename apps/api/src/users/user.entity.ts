import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  provider: string; // google, etc.

  @Column()
  providerId: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  picture: string | null; // 프로필 이미지 URL (없을 수 있음)

  @Column({ default: 'user' })
  role: 'user' | 'admin';

  @Column({ default: 'active' })
  status: 'active' | 'suspended';

  @Column({ type: 'datetime', nullable: true })
  lastLogin: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastLogout: Date | null;
}
