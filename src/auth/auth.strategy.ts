import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy,) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET||'INSECURE',
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId, roles: payload.roles };
  }
}
