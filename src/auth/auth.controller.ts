import { Controller, Get, Body, Post, UseGuards, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createUser, createRole, login,  } from './dto/auth.dto';

import { JWTAdminGuard, JWTAuthGuard } from './auth.guard';
import { GetAuthUser, useRoles } from './auth.decorator';
@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Get('/users')
  @useRoles('admin')
  @UseGuards(JWTAuthGuard)
  async getUsers(@GetAuthUser() user: any): Promise<any> {
    return this.authService.getUsers(user);
  }

  @Post('/auth/register')
  async createUser(@Body() dto: createUser): Promise<any> {
    return this.authService.createUser(dto);
  }

  @UseGuards(JWTAuthGuard, JWTAdminGuard)
  @Post('/auth/create/role')
  async createRole(@Body() dto: createRole): Promise<any> {
    return this.authService.createRole(dto,"");
  }

  @Post('/auth/login')
  async login(@Body() dto: login): Promise<any> {
    return this.authService.login(dto);
  } 

  @UseGuards(JWTAuthGuard)
  @Post('/users/assign-role')
  @useRoles('admin')
 async assignRole(@GetAuthUser() user: any, @Body('id') id: string, @Body('roleId') roleId: string) {
    return await this.authService.assignRole(id,user,+roleId);
  }
  @UseGuards(JWTAuthGuard)
  @useRoles('admin')
  @Delete('/user/:id')
  async deleteSpecificUser(@Param('id') id: string, @GetAuthUser() user: any){
return await this.authService.deleteUser(id,user);
  }

  @Get('/roles')
  @useRoles('admin')
  @UseGuards(JWTAuthGuard)
async getRoles (@GetAuthUser() user: any){
  return await this.authService.getRoles(user);
  }
}

