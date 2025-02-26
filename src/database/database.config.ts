import { InternalServerErrorException, Logger } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';

const getConfig = (): TypeOrmModuleOptions => {
  const logger = new Logger('Get configs from env', {
    timestamp: true,
  });

  const port = Number(process.env.POSTGRES_PORT);
  if (isNaN(port)) {
    logger.error(`Invalid POSTGRES_PORT ${port}`);
    throw new InternalServerErrorException('POSTGRES_PORT must be a number');
  }

  return {
    type: 'postgres',
    port,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    synchronize: process.env.NODE_ENV === 'DEV', // change this to use migrations in production
  };
};

export const config = getConfig();
