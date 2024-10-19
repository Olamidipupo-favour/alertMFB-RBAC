import {Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus,} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt') {

}


@Injectable()
export class JWTAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, params } = request;
console.log(user.role);
    if (user.role.includes()) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }
    return true;
  }
}