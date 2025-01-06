import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Wallet } from './wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async create(user: User): Promise<Wallet> {
    return this.walletRepository.save({
      user,
    });
  }

  async getWalletUserBalance(user: JwtPayloadDto): Promise<number> {
    if (!user || !user.userId) {
      throw new ForbiddenException();
    }

    const wallet = await this.walletRepository.findOne({
      where: {
        user: {
          id: user.userId,
        },
      },
    });

    return wallet.balance;
  }
}
