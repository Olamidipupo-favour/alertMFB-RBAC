import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { hash, compare } from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    role: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('getUsers', () => {
    it('should return a list of users with pagination', async () => {
      const users = [{ id: 'user-id', email: 'user@example.com' }];
      const totalCount = 10;
      const authUser = { roles: [{ name: 'admin' }] };

      mockPrismaService.user.findMany.mockResolvedValue(users);
      mockPrismaService.user.count.mockResolvedValue(totalCount);

      const result = await authService.getUsers(authUser, 1, 5);
      expect(result.data).toEqual(users);
      expect(result.meta).toEqual({
        skipped: 0,
        limit: 5,
        page: 1,
        totalCount,
        hasNext: true,
        hasPrev: false,
      });
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
      expect(mockPrismaService.user.count).toHaveBeenCalled();
    });

    it('should throw an error if user is not an admin', async () => {
      const authUser = { roles: [{ name: 'user' }] };

      await expect(authService.getUsers(authUser)).rejects.toThrow(
        new HttpException('Only admins can get a list of all users', HttpStatus.FORBIDDEN),
      );
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const dto = { email: 'user@example.com', firstName: 'John', lastName: 'Doe', password: 'password' };

      mockPrismaService.user.create.mockResolvedValue(true);

      const result = await authService.createUser(dto);
      expect(result.message).toBe('User succesfully created!');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          passwordHash: expect.any(String),
          roles: {
            connectOrCreate: {
              where: { id: 2, name: 'user' },
              create: { id: 2, name: 'user', permissions: JSON.stringify(['WRITE']) },
            },
          },
        },
      });
    });
  });

  describe('createRole', () => {
    it('should create a role successfully when user is admin', async () => {
      const dto = { name: 'admin', permissions: ['READ', 'WRITE'] };
      const authUser = { roles: [{ name: 'admin' }] };

      mockPrismaService.role.create.mockResolvedValue(true);

      const result = await authService.createRole(dto, authUser);
      expect(result.message).toBe('Role succesfully created!');
      expect(mockPrismaService.role.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          permissions: JSON.stringify(dto.permissions),
        },
      });
    });

    it('should throw an error when non-admin user tries to create a role', async () => {
      const dto = { name: 'admin', permissions: ['READ', 'WRITE'] };
      const authUser = { roles: [{ name: 'user' }] };

      await expect(authService.createRole(dto, authUser)).rejects.toThrow(
        new HttpException('Only admins can create roles', HttpStatus.FORBIDDEN),
      );
    });

    it('should throw an error if invalid permission is provided', async () => {
      const dto = { name: 'admin', permissions: ['INVALID'] };
      const authUser = { roles: [{ name: 'admin' }] };

      await expect(authService.createRole(dto, authUser)).rejects.toThrow(
        new HttpException('Invalid permission: INVALID', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('login', () => {
    it('should return a JWT token when credentials are valid', async () => {
      const dto = { email: 'user@example.com', password: 'password' };
      const user = { id: 'user-id', email: 'user@example.com', passwordHash: await hash('password', 10), roles: [] };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await authService.login(dto);
      expect(result.data).toEqual({ access_token: 'jwt_token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ userId: 'user-id', roles: [] });
    });

    it('should throw an error when credentials are invalid', async () => {
      const dto = { email: 'user@example.com', password: 'wrong_password' };
      const user = { id: 'user-id', email: 'user@example.com', passwordHash: await hash('password', 10), roles: [] };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      await expect(authService.login(dto)).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      const id = 'user-id';
      const authUser = { userId: 'admin-id', roles: [{ name: 'admin' }] };

      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue({
        id,
        roles: [{ name: 'admin' }],
      });

      mockPrismaService.user.delete.mockResolvedValue(true);

      const result = await authService.deleteUser(id, authUser);
      expect(result.message).toBe('User succesfully deleted!');
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw an error if user tries to delete their own account', async () => {
      const id = 'admin-id';
      const authUser = { userId: 'admin-id', roles: [{ name: 'admin' }] };

      await expect(authService.deleteUser(id, authUser)).rejects.toThrow(
        new HttpException("You can't delete your own account", HttpStatus.FORBIDDEN),
      );
    });

    it('should throw an error if non-admin tries to delete another user', async () => {
      const id = 'user-id';
      const authUser = { userId: 'admin-id', roles: [{ name: 'user' }] };

      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue({
        id,
        roles: [{ name: 'user' }],
      });

      await expect(authService.deleteUser(id, authUser)).rejects.toThrow(
        new HttpException("You don't have the required permissions to delete this user", HttpStatus.FORBIDDEN),
      );
    });
  });

  describe('assignRole', () => {
    it('should assign a role to a user successfully', async () => {
      const authUser = { roles: [{ name: 'admin' }] };
      const userId = 'user-id';
      const roleId = 1;

      mockPrismaService.user.update.mockResolvedValue(true);

      const result = await authService.assignRole(userId, authUser, roleId);
      expect(result.message).toBe('Role succesfully assigned!');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          roles: { connect: { id: roleId } },
        },
      });
    });
  });

  describe('getRoles', () => {
    it('should return a list of roles with pagination', async () => {
      const roles = [{ id: 'role-id', name: 'admin' }];
      const totalCount = 5;
      const authUser = { roles: [{ name: 'admin' }] };

      mockPrismaService.role.findMany.mockResolvedValue(roles);
      mockPrismaService.role.count.mockResolvedValue(totalCount);

      const result = await authService.getRoles(authUser, 1, 5);
      expect(result.data).toEqual(roles);
      expect(result.meta).toEqual({
        skipped: 0,
        limit: 5,
        page: 1,
        totalCount,
        hasNext: false,
        hasPrev: false,
      });
      expect(mockPrismaService.role.findMany).toHaveBeenCalled();
      expect(mockPrismaService.role.count).toHaveBeenCalled();
    });
  });
});
