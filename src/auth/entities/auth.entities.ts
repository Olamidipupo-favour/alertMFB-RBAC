import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  id: string;

  firstName?: string;

  lastName?: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  roles?: string[];
  // @ApiProperty({ example: 1, description: 'The age of the Cat' })
}


export class RoleEntity {
    name: string;
  permissions: string;
  }

  export interface IcommonReturn{
    message: string,
    data?: any,
    error?: any,
    meta?:any
  }