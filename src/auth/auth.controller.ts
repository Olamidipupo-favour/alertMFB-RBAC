import {
  Controller,
  Get,
  Body,
  Post,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { createUser, createRole, login } from './dto/auth.dto';

import { JWTAdminGuard, JWTAuthGuard } from './guards/auth.guard';
import { GetAuthUser, useRoles } from './decorators/auth.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin Only: Get all users' })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @Get('/users')
  @useRoles('admin')
  @UseGuards(JWTAuthGuard)
  async getUsers(@GetAuthUser() user: any): Promise<any> {
    return this.authService.getUsers(user);
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User succesfully created!',
  })
  @Post('/auth/register')
  async createUser(@Body() dto: createUser): Promise<any> {
    return this.authService.createUser(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new role ' })
  @ApiResponse({
    status: 201,
    description: 'Role succesfully created!',
  })
  @UseGuards(JWTAuthGuard, JWTAdminGuard)
  @Post('/auth/create/role')
  async createRole(@Body() dto: createRole): Promise<any> {
    return this.authService.createRole(dto, '');
  }

  @ApiOperation({ summary: 'login' })
  @ApiResponse({ status: 200, description: '*returns your jwt token*' })
  @Post('/auth/login')
  async login(@Body() dto: login): Promise<any> {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the roles of  a user' })
  @ApiResponse({
    status: 201,
    description: 'Role succesfully assigned!',
  })
  @UseGuards(JWTAuthGuard)
  @Post('/users/assign-role')
  @useRoles('admin')
  async assignRole(
    @GetAuthUser() user: any,
    @Body('id') id: string,
    @Body('roleId') roleId: string,
  ) {
    return await this.authService.assignRole(id, user, +roleId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin Only: remove a user with the specified id' })
  @ApiResponse({
    status: 201,
    description: 'User succesfully deleted!',
  })
  @UseGuards(JWTAuthGuard)
  @useRoles('admin')
  @Delete('/user/:id')
  async deleteSpecificUser(@Param('id') id: string, @GetAuthUser() user: any) {
    return await this.authService.deleteUser(id, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch all roles' })
  @ApiResponse({
    status: 200,
    description: 'All roles fetched!',
  })
  @Get('/roles')
  @useRoles('admin')
  @UseGuards(JWTAuthGuard)
  async getRoles(@GetAuthUser() user: any) {
    return await this.authService.getRoles(user);
  }
}
