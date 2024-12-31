import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name, {
    timestamp: true,
  });

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, passcode: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.error(`User with email ${email} not found`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(passcode, user.password);
    if (isPasswordValid) {
      delete user.password;
      return user;
    }

    this.logger.error(`Invalid password for user with email ${email}`);
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async signup(userDto: CreateUserDto) {
    const dbUser = await this.usersService.create(userDto);
    const payload = { email: dbUser.email, sub: dbUser.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
