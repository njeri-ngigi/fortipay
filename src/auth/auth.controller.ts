import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from 'src/users/dto/login-user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiParam({ name: 'password' })
  @ApiParam({ name: 'email' })
  @ApiResponse({ status: 200, description: 'User logged in' })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Signup user' })
  @ApiParam({ name: 'password' })
  @ApiParam({ name: 'email' })
  @ApiParam({ name: 'name' })
  @ApiResponse({ status: 200, description: 'User signed up' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async signup(@Body() registerDto: CreateUserDto) {
    return this.authService.signup(registerDto);
  }
}
