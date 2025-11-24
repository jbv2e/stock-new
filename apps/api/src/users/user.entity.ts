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

  @Column({ nullable: true })
  picture: string;
}
