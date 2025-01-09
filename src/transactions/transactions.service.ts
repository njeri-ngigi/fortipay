import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';

export type PartialTransaction = Omit<Transaction, 'createdAt' | 'id'>;

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  findOneByIdempotencyKey(idempotencyKey: string): Promise<Transaction> {
    return this.transactionsRepository.findOne({
      where: {
        idempotencyKey,
      },
    });
  }

  create(transaction: PartialTransaction): Promise<Transaction> {
    return this.transactionsRepository.save(transaction);
  }
}
