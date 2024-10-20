import {
  Controller,
  Get,
  Body,
  Post,
  UseGuards,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { createUser, createRole, login, assignRole } from './dto/auth.dto';

import { roleGuard, JWTAuthGuard } from './guards/auth.guard';
import { GetAuthUser, useRoles } from './decorators/auth.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IcommonReturn, IUser } from './entities/auth.entities';
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
  @UseGuards(JWTAuthGuard, roleGuard)
  async getUsers(
    @GetAuthUser() user: IUser,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<IcommonReturn> {
    return this.authService.getUsers(user, +page, +limit);
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User succesfully created!',
  })
  @Post('/auth/register')
  async createUser(@Body() dto: createUser): Promise<IcommonReturn> {
    return this.authService.createUser(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new role ' })
  @ApiResponse({
    status: 201,
    description: 'Role succesfully created!',
  })
  @useRoles('admin')
  @UseGuards(JWTAuthGuard, roleGuard)
  @Post('/auth/create/role')
  async createRole(@Body() dto: createRole, @GetAuthUser() user: IUser): Promise<IcommonReturn> {
    return this.authService.createRole(dto, user );
  }

  @ApiOperation({ summary: 'login' })
  @ApiResponse({ status: 200, description: '*returns your jwt token*' })
  @Post('/auth/login')
  async login(@Body() dto: login): Promise<IcommonReturn> {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the roles of  a user' })
  @ApiResponse({
    status: 201,
    description: 'Role succesfully assigned!',
  })
  @useRoles('admin')
  @UseGuards(JWTAuthGuard, roleGuard)
  @Post('/user/assign-role')
  async assignRole(
    @GetAuthUser() user: IUser,
   @Body() dto: assignRole
  ): Promise<IcommonReturn> {
    return await this.authService.assignRole(dto.id, user, +dto.roleId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin Only: remove a user with the specified id' })
  @ApiResponse({
    status: 201,
    description: 'User succesfully deleted!',
  })
  @useRoles('admin')
  @UseGuards(JWTAuthGuard, roleGuard)
  @Delete('/user/:id')
  async deleteSpecificUser(
    @Param('id') id: string,
    @GetAuthUser() user: IUser,
  ): Promise<IcommonReturn> {
    return await this.authService.deleteUser(id, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch all roles' })
  @ApiResponse({
    status: 200,
    description: 'All roles fetched!',
  })
  @useRoles('admin')
  @UseGuards(JWTAuthGuard, roleGuard)
  @Get('/roles')
  async getRoles(
    @GetAuthUser() user: IUser,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<IcommonReturn> {
    return await this.authService.getRoles(user, +page, +limit);
  }
}
