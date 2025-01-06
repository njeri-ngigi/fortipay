import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  getUserWalletBalance(@Request() req) {
    return this.walletService.getWalletUserBalance(req.user);
  }
}
