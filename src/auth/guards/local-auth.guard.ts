import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  private readonly logger = new Logger(LocalAuthGuard.name, {
    timestamp: true,
  });

  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err || !user) {
      this.logger.error('Missing credentials');
      throw err || new UnauthorizedException('Missing credentials');
    }
    return user;
  }
}
