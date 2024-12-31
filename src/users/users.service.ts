import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletService } from '../wallet/wallet.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name, {
    timestamp: true,
  });

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
      this.logger.error(`User with email ${user.email} already exists`);
      throw new ConflictException('Email already in use');
    }

    const dbUser = await this.usersRepository.save(user);
    this.logger.log(`User with email ${user.email} created`);

    await this.walletService.create(dbUser);
    this.logger.log(`Wallet created for user with email ${user.email}`);

    delete dbUser.password;

    return dbUser;
  }
}
