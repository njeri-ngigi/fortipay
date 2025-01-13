import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_START_PAGE,
} from 'src/common/constants';
import { PaginationRequestDto } from 'src/common/dto/pagination-request.dto';
import { IPaginatedResults } from 'src/common/types';
import { Wallet } from 'src/wallet/wallet.entity';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';

export type PartialTransaction = Omit<Transaction, 'createdAt' | 'id'>;
export type PaginatedTransactionsResponse = {
  wallet: Wallet;
  transactions: IPaginatedResults<Transaction>;
};

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

  async getPaginatedTransactions(
    wallet: Wallet,
    paginationData: PaginationRequestDto,
  ): Promise<PaginatedTransactionsResponse> {
    const {
      limit = DEFAULT_PAGINATION_LIMIT,
      page = DEFAULT_PAGINATION_START_PAGE,
    } = paginationData;
    const [data, total] = await this.transactionsRepository.findAndCount({
      where: {
        wallet: { id: wallet.id },
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const transactions = {
      data,
      currentPage: page,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return {
      wallet,
      transactions,
    };
  }
}
