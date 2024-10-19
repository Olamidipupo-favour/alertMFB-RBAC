import {
  IsEmail,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsStrongPassword,
  IsInt,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
export class createUser {
  @ApiProperty({example:"test@example.com",description:"Email"})
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({description:"Strong password."})
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiProperty({example:"firstName",description:"firstName"})
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({example:"lastName",description:"last name"})
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class createRole {
  @ApiProperty({example:"roleName",description:"name of the role"})
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({example:`["READ"]`,description:"Array of permissions, as defined in th attached document. They're currently only two accepted values; READ & WRITE"})
  @IsNotEmpty()
  @IsArray()
  permissions: string[];
}

export class login {
  @ApiProperty({example:"test@example.com",description:"Login email"})
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({description:"Strong password"})
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;

}

export class assignRole {
  @ApiProperty({example:"1",description:"ID of the user"})
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({example:"1",description:"ID of the role"})
  @IsNotEmpty()
  @IsInt()
  roleId: number;
}