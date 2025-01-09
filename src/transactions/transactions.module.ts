import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { TransactionsService } from './transactions.service';

@Module({
  providers: [TransactionsService],
  imports: [TypeOrmModule.forFeature([Transaction])],
  exports: [TransactionsService],
})
export class TransactionsModule {}
