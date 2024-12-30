import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, passcode: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    const isPasswordValid = await bcrypt.compare(passcode, user.password);

    if (user && isPasswordValid) {
      delete user.password;
      return user;
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(userDto: CreateUserDto) {
    return this.usersService.create(userDto);
  }
}
