import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaginatedTransactionsResponse } from 'src/transactions/transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationRequestDto } from '../common/dto/pagination-request.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferFundsDto } from './dto/transfer-funds.dto';
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
  @ApiQuery({
    name: 'page',
    description: 'The page number (1-based index)',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of items per page',
    example: 10,
    required: false,
  })
  getUserTransactions(
    @Request() req,
    @Query() query: PaginationRequestDto,
  ): Promise<PaginatedTransactionsResponse> {
    return this.walletService.getUserTransactions(req.user, query);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Put('transfer')
  @ApiOperation({ summary: "Transfer funds to another a user's wallet" })
  transferFundsToAnotherUser(@Request() req, @Body() body: TransferFundsDto) {
    return this.walletService.transferFundsToAnotherUser(req.user, body);
  }
}
