import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createUser, createRole, login } from './dto/auth.dto';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserEntity, RoleEntity, IcommonReturn } from './entities/auth.entities';
@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}

  //test

  getUsers = async (user: any,page:number=1,limit:number=10): Promise<IcommonReturn> => {
    if (!user.roles.some((r) => r.name === 'admin'))
      throw new HttpException(
        'Only admins can get a list of all users',
        HttpStatus.FORBIDDEN,
      );

      const skipped: number = (page-1)*limit;
    return {
message:"Fetched all users succesfully!",
data: await this.prisma.user.findMany(
      {
        take: limit,
      skip: skipped,
      }
    ),
    meta: {
skipped,
limit,
page,
    totalCount: await this.prisma.user.count(),
    hasNext: (await this.prisma.user.count() - (skipped+limit))>0? true: false,
    hasPrev:  skipped>0?true:false
    },
  
    }
  };

  createUser = async (dto: createUser): Promise<IcommonReturn> => {
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

  createRole = async (dto: createRole, user: any): Promise< IcommonReturn> => {
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

  login = async (dto: login): Promise<IcommonReturn> => {
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
      message:"user logged in succesfully!",
      data: {
      access_token: this.jwtService.sign(payload),
      },
      meta:{
        loggedInAt: new Date()
      }
    };
  };

  deleteUser = async (id: string, user: any): Promise<IcommonReturn> => {
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

  assignRole = async (id: string, user: any, roleId: number): Promise<IcommonReturn> => {
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
  getRoles = async (user: any, page:number=1,limit:number=10,): Promise<IcommonReturn> => {
    if (!user.roles.some((r) => r.name === 'admin')) {
      throw new HttpException(
        "You don't have the required permissions to get roles",
        HttpStatus.FORBIDDEN,
      );
    }
    const skipped: number = (page-1)*limit;
    return {
message:"Fetched all users succesfully!",
data: await this.prisma.role.findMany(
      {
        take: limit,
      skip: skipped,
      }
    ),
    meta: {
skipped,
limit,
page,
    totalCount: await this.prisma.role.count(),
    hasNext: (await this.prisma.role.count() - (skipped+limit))>0? true: false,
    hasPrev:  skipped>0?true:false
    },
  
    }
  };
}
