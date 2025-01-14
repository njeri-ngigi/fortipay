import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BigNumber } from 'bignumber.js';
import {
  TransactionStatus,
  TransactionType,
} from 'src/transactions/transaction.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { PaginationRequestDto } from '../common/dto/pagination-request.dto';
import {
  PaginatedTransactionsResponse,
  TransactionsService,
} from '../transactions/transactions.service';
import { User } from '../users/user.entity';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferFundsDto } from './dto/transfer-funds.dto';
import { WithdrawWalletDto } from './dto/withdraw-wallet.dto';
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

  async findWalletByUser(
    user: Partial<Pick<User, 'id' | 'email'>>,
  ): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: {
        user: {
          ...user,
        },
      },
    });
    if (!wallet) {
      this.logger.error(`Wallet for ${user.id ?? user.email} not found.`);
      throw new NotFoundException('Wallet not found.');
    }
    return wallet;
  }

  async getWalletUserBalance(user: JwtPayloadDto): Promise<number> {
    const wallet = await this.findWalletByUser({ id: user.userId });
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

  private _defundWallet(wallet: Wallet, amount: number): string {
    const amountToBeDeducted = new BigNumber(amount);
    const currentBalance = new BigNumber(wallet.balance);
    if (currentBalance.isLessThan(amountToBeDeducted)) {
      this.logger.error(`Insufficient balance for user wallet: ${wallet.id}`);
      throw new BadRequestException('Insufficient funds in wallet');
    }
    return currentBalance.minus(amountToBeDeducted).toFixed(2);
  }

  private _fundWallet(wallet: Wallet, amount: number): string {
    return new BigNumber(wallet.balance).plus(amount).toFixed(2);
  }

  private async _startDatabaseTransaction(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    return queryRunner;
  }

  private async _updateWalletAndCreateTransaction(
    wallet: Wallet,
    amount: number,
    idempotencyKey: string,
    transactionType: TransactionType,
  ): Promise<void> {
    const queryRunner = await this._startDatabaseTransaction();
    try {
      await this.walletRepository.save(wallet);
      await this.transactionsService.create({
        amount: new BigNumber(amount).toFixed(2),
        wallet,
        idempotencyKey,
        status: TransactionStatus.Completed,
        transactionType,
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      this.logger.error(
        `Transaction failed to update the wallet: ${wallet.id}. 
        Failed to create the transaction with idempotency key: ${idempotencyKey}`,
      );
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async _updateTransferWalletsAndCreateTransactions(
    senderWallet: Wallet,
    recipientWallet: Wallet,
    amount: number,
    idempotencyKey: string,
  ): Promise<void> {
    const queryRunner = await this._startDatabaseTransaction();
    try {
      await this.walletRepository.save(senderWallet);
      await this.transactionsService.create({
        amount: new BigNumber(amount).toFixed(2),
        wallet: senderWallet,
        idempotencyKey,
        status: TransactionStatus.Completed,
        transactionType: TransactionType.Transfer,
      });
      await this.walletRepository.save(recipientWallet);
      await this.transactionsService.create({
        amount: new BigNumber(amount).toFixed(2),
        wallet: recipientWallet,
        idempotencyKey: `${idempotencyKey}-2`,
        status: TransactionStatus.Completed,
        transactionType: TransactionType.Received,
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      this.logger.error(
        `Transfer from sender with walletId: ${senderWallet.id} to recipient with walletId ${recipientWallet.id} failed`,
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

    const wallet = await this.findWalletByUser({ id: user.userId });
    wallet.balance = this._fundWallet(wallet, amount);

    await this._updateWalletAndCreateTransaction(
      wallet,
      amount,
      idempotencyKey,
      TransactionType.Deposit,
    );

    return wallet;
  }

  async withdrawFromUserWallet(
    user: JwtPayloadDto,
    data: WithdrawWalletDto,
  ): Promise<Wallet> {
    const { idempotencyKey, amount } = data;

    await this._ensureTransactionIsUnique(idempotencyKey);

    const wallet = await this.findWalletByUser({ id: user.userId });
    wallet.balance = this._defundWallet(wallet, amount);

    await this._updateWalletAndCreateTransaction(
      wallet,
      amount,
      idempotencyKey,
      TransactionType.Withdrawal,
    );

    return wallet;
  }

  async transferFundsToAnotherUser(
    user: JwtPayloadDto,
    recipientData: TransferFundsDto,
  ): Promise<Wallet> {
    const { amount, recipientEmail, idempotencyKey } = recipientData;

    await this._ensureTransactionIsUnique(idempotencyKey);

    const senderWallet = await this.findWalletByUser({ id: user.userId });
    const recipientWallet = await this.findWalletByUser({
      email: recipientEmail,
    });

    if (senderWallet.id === recipientWallet.id) {
      throw new BadRequestException('Cannot send funds to yourself');
    }

    senderWallet.balance = this._defundWallet(senderWallet, amount);
    recipientWallet.balance = this._fundWallet(recipientWallet, amount);

    await this._updateTransferWalletsAndCreateTransactions(
      senderWallet,
      recipientWallet,
      amount,
      idempotencyKey,
    );

    return senderWallet;
  }

  async getUserTransactions(
    user: JwtPayloadDto,
    paginationData: PaginationRequestDto,
  ): Promise<PaginatedTransactionsResponse> {
    const wallet = await this.findWalletByUser({ id: user.userId });

    return this.transactionsService.getPaginatedTransactions(
      wallet,
      paginationData,
    );
  }
}
