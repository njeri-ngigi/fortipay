import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletService } from 'src/wallet/wallet.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private walletService: WalletService,
  ) {}

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(user: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const dbUser = await this.usersRepository.save(user);
    await this.walletService.create(dbUser);

    delete dbUser.password;

    return dbUser;
  }
}
