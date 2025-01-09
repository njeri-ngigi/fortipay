import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { WithdrawWalletDto } from './dto/withdraw-wallet.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  getWalletBalance(@Request() req) {
    return this.walletService.getWalletUserBalance(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Put('fund')
  @ApiOperation({ summary: 'Fund wallet balance' })
  fundWalletBalance(@Request() req, @Body() body: FundWalletDto) {
    return this.walletService.fundUserWallet(req.user, body);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Put('withdraw')
  @ApiOperation({ summary: 'Withdraw from wallet balance' })
  withdrawWalletBalance(@Request() req, @Body() body: WithdrawWalletDto) {
    return this.walletService.withdrawFromUserWallet(req.user, body);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  @ApiOperation({ summary: 'Get a users transactions' })
  getUserTransactions(@Request() req) {
    return this.walletService.getUserTransactions(req.user);
  }
}
