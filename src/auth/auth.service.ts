import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createUser, createRole, login } from './dto/auth.dto';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}

  //test

  getUsers = async (user: any) => {
    if (!user.roles.some((r) => r.name === 'admin'))
      throw new HttpException(
        'Only admins can get a list of all users',
        HttpStatus.FORBIDDEN,
      );
    return await this.prisma.user.findMany();
  };

  createUser = async (dto: createUser) => {
    await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash: await hash(dto.password, 10),
        roles: {
          connectOrCreate: {
            where: {
              id: 2, //user
              name: 'user',
            },
            create: {
              id: 2,
              name: 'user',
              permissions: JSON.stringify(['WRITE']),
            },
          },
        },
      },
    });

    return {
      message: 'User succesfully created!',
    };
  };

  createRole = async (dto: createRole, user: any) => {
    if (!user.roles.some((r) => r.name === 'admin')) {
      throw new HttpException(
        'Only admins can create roles',
        HttpStatus.FORBIDDEN,
      );
    }
    const permissions = ['READ', 'WRITE'];
    for (let i of dto.permissions) {
      if (!permissions.includes(i)) {
        throw new HttpException(
          `Invalid permission: ${i}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    await this.prisma.role.create({
      data: {
        name: dto.name,
        permissions: JSON.stringify(dto.permissions),
      },
    });

    return {
      message: 'Role succesfully created!',
    };
  };

  login = async (dto: login) => {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: true },
    });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    console.log(user);
    const payload = { userId: user.id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  };

  deleteUser = async (id: string, user: any) => {
    if (user.userId === id) {
      throw new HttpException(
        "You can't delete your own account",
        HttpStatus.FORBIDDEN,
      );
    }
    //confirm user is an admin
    const user_ = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: { roles: true },
    });
    if (!user_.roles.some((r) => r.name === 'admin')) {
      throw new HttpException(
        "You don't have the required permissions to delete this user",
        HttpStatus.FORBIDDEN,
      );
    }
    await this.prisma.user.delete({ where: { id } });
    return {
      message: 'User succesfully deleted!',
    };
  };

  assignRole = async (id: string, user: any, roleId: number) => {
    //confirm user is an admin
    if (!user.roles.some((r) => r.name === 'admin')) {
      throw new HttpException(
        "You don't have the required permissions to assign roles to this user",
        HttpStatus.FORBIDDEN,
      );
    }
    await this.prisma.user.update({
      where: { id },
      data: {
        roles: {
          connect: {
            id: roleId,
          },
        },
      },
    });
    return {
      message: 'Role succesfully assigned!',
    };
  };
  getRoles = async (user: any) => {
    if (!user.roles.some((r) => r.name === 'admin')) {
      throw new HttpException(
        "You don't have the required permissions to get roles",
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.prisma.role.findMany();
  };
}
