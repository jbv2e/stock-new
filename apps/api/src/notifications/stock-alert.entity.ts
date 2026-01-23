import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

// 사용자별 종목 알림 설정 엔티티
@Entity()
export class StockAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  symbol: string; // 종목 코드

  @Column({ type: 'float' })
  targetPrice: number; // 알림 목표가

  @Column()
  direction: 'up' | 'down'; // 상승/하락 트리거

  @CreateDateColumn()
  createdAt: Date;
}
