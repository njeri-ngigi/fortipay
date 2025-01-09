import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Wallet } from '../wallet/wallet.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  amount: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  idempotencyKey: string;

  @Column({
    type: 'enum',
    enum: ['deposit', 'withdrawal', 'transfer'],
  })
  transactionType: 'deposit' | 'withdrawal' | 'transfer';

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed'],
  })
  status: 'pending' | 'completed' | 'failed';

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet: Wallet;
}
