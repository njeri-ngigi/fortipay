import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from '../transactions/transactions.module';
import { WalletController } from './wallet.controller';
import { Wallet } from './wallet.entity';
import { WalletService } from './wallet.service';

@Module({
  providers: [WalletService],
  imports: [TypeOrmModule.forFeature([Wallet]), TransactionsModule],
  exports: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
