import { InternalServerErrorException } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import { User } from 'src/users/user.entity';
import { Wallet } from 'src/wallet/wallet.entity';

dotenv.config();

const getConfig = (): TypeOrmModuleOptions => {
  const port = Number(process.env.POSTGRES_PORT);
  if (isNaN(port)) {
    throw new InternalServerErrorException('POSTGRES_PORT must be a number');
  }

  return {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port,
    type: 'postgres',
    entities: [User, Wallet],
  };
};

export default getConfig();
