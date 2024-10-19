import { Controller, Get, Body, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createUser, createRole, login } from './dto/auth.dto';

import { JWTAdminGuard, JWTAuthGuard } from './auth.guard';
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JWTAuthGuard)
  @Get('/test')
  async testDb(): Promise<any> {
    return this.authService.testDb();
  }
  @Post('/create/user')
  async createUser(@Body() dto: createUser): Promise<any> {
    return this.authService.createUser(dto,"");
  }

  @Post('/create/role')
  async createRole(@Body() dto: createRole): Promise<any> {
    return this.authService.createRole(dto,"");
  }

  @Post('/login')
  async login(@Body() dto: login): Promise<any> {
    return this.authService.login(dto);
  } 
}
