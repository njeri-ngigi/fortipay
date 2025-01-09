import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FundWalletDto } from './dto/fund-wallet.dto';
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
  @Patch('fund')
  @ApiOperation({ summary: 'Fund wallet balance' })
  fundWalletBalance(@Request() req, @Body() body: FundWalletDto) {
    return this.walletService.fundUserWallet(req.user, body);
  }
}
