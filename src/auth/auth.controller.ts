import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiParam({ name: 'password' })
  @ApiParam({ name: 'email' })
  @ApiResponse({ status: 200, description: 'User logged in' })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  @ApiOperation({ summary: 'Signup user' })
  @ApiParam({ name: 'password' })
  @ApiParam({ name: 'email' })
  @ApiParam({ name: 'name' })
  @ApiResponse({ status: 201, description: 'User signed up' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async signup(@Body() registerDto: CreateUserDto) {
    return this.authService.signup(registerDto);
  }
}
