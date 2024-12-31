import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './wallet.entity';
import { WalletService } from './wallet.service';

@Module({
  providers: [WalletService],
  imports: [TypeOrmModule.forFeature([Wallet])],
  exports: [WalletService],
})
export class WalletModule {}
