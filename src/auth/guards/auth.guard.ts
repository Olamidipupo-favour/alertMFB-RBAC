import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class roleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const roles = Reflect.getMetadata('roles', context.getHandler());
    const { user, params } = request;
    if (!roles.every(r=>user.roles.some(p=>p.name===r))) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }
    return true;
  }
}
