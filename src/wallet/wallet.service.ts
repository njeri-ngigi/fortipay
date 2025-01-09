import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BigNumber } from 'bignumber.js';
import { DataSource, Repository } from 'typeorm';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import {
  PartialTransaction,
  TransactionsService,
} from '../transactions/transactions.service';
import { User } from '../users/user.entity';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { Wallet } from './wallet.entity';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name, {
    timestamp: true,
  });

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private transactionsService: TransactionsService,
    private dataSource: DataSource,
  ) {}

  create(user: User): Promise<Wallet> {
    return this.walletRepository.save({
      user,
    });
  }

  async findWalletByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });
    if (!wallet) {
      this.logger.error(`Wallet for ${userId} not found.`);
      throw new NotFoundException('Wallet not found.');
    }
    return wallet;
  }

  async getWalletUserBalance(user: JwtPayloadDto): Promise<number> {
    const wallet = await this.findWalletByUserId(user.userId);
    return parseFloat(wallet.balance);
  }

  private async _ensureTransactionIsUnique(idempotencyKey) {
    const transaction =
      await this.transactionsService.findOneByIdempotencyKey(idempotencyKey);
    if (transaction) {
      this.logger.error(
        `Transaction ${transaction.id} already recorded. Status ${transaction.status}`,
      );
      throw new ConflictException(
        `Transaction already recorded. Status ${transaction.status}`,
      );
    }
  }

  async createTransaction(transaction: PartialTransaction, wallet: Wallet) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.walletRepository.save(wallet);
      await this.transactionsService.create(transaction);
      await queryRunner.commitTransaction();
    } catch (err) {
      this.logger.error(
        `Transaction failed to update the wallet: ${wallet.id}. 
        Failed to create the transaction with idempotency key: ${transaction.idempotencyKey}`,
      );
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async fundUserWallet(
    user: JwtPayloadDto,
    data: FundWalletDto,
  ): Promise<Wallet> {
    const { idempotencyKey, amount } = data;

    await this._ensureTransactionIsUnique(idempotencyKey);

    const wallet = await this.findWalletByUserId(user.userId);
    const currentBalance = new BigNumber(wallet.balance);
    const newBalance = currentBalance.plus(new BigNumber(amount));

    wallet.balance = newBalance.toFixed(2);

    const transaction: PartialTransaction = {
      amount: new BigNumber(amount).toFixed(2),
      wallet,
      idempotencyKey,
      status: 'completed',
      transactionType: 'deposit',
    };

    await this.createTransaction(transaction, wallet);

    return wallet;
  }
}
