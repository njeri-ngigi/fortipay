import { Module } from '@nestjs/common';
import { User } from './user.entity';

@Module({
  providers: [User],
})
export class UsersModule {}
