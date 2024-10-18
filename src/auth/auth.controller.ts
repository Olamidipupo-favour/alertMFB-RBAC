import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/test')
  async testDb(): Promise<any> {
    return this.authService.testDb();
  }
}
