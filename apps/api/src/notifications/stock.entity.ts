import { Entity, Column, PrimaryColumn } from 'typeorm';

// 종목 메타 정보 (심볼/이름)
@Entity()
export class Stock {
  @PrimaryColumn()
  symbol: string; // 종목 코드 (고유)

  @Column()
  name: string; // 종목명
}
