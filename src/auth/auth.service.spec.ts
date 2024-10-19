import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
const bcrypt = require('bcrypt');
describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              update: jest.fn(),
            },
            role: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('createUser', () => {
    it('should create a user and return success message', async () => {
      const dto = {
        email: 'test@test.com',
        firstName: 'test',
        lastName: 'test',
        password: 'password123',
      };

      jest.spyOn(prismaService.user, 'create').mockResolvedValueOnce(null);

      const result = await service.createUser(dto);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          passwordHash: expect.any(String),
          roles: expect.any(Object),
        }),
      });
      expect(result).toEqual({
        message: 'User succesfully created!',
      });
    });
  });

  describe('login', () => {
    it('should throw error if user is not found', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.login(dto)).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw error if password is invalid', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      const user = {
        id:"should-be-a-uuid",
        firstName:"",
        lastName:"",
        email: dto.email,
        passwordHash: await hash(dto.password, 10),
        createdAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      await expect(service.login(dto)).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should return an access token if credentials are valid', async () => {
      const dto = { email: 'test@example.com', password: 'password123', firstName:'test', lastName:'test' };
      const user = {
        id: 'should-be-a-uuid',
        email: 'test@test.com',
        passwordHash: await hash(dto.password, 10),
        createdAt: new Date(),
        firstName:dto.firstName,
        lastName:dto.lastName,
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('test_token');

      const result = await service.login(dto);
      expect(result).toEqual({
        access_token: 'test_token',
      });
    });
  });

  describe('getUsers', () => {
    it('should throw forbidden error if user is not admin', async () => {
      const user = { roles: [{ name: 'user' }] };

      await expect(service.getUsers(user)).rejects.toThrow(
        new HttpException(
          'Only admins can get a list of all users',
          HttpStatus.FORBIDDEN,
        ),
      );
    });

    it('should return list of users if user is admin', async () => {
      const user = { roles: [{ name: 'admin' }] };
      const users = [
        {
          id:"should-be-a-uuid",
          firstName:"",
          lastName:"",
          email: 'test@test.com',
          passwordHash: await hash('Password123!', 10),
          createdAt: new Date(),
        }
      ];
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValueOnce(users);

      const result = await service.getUsers(user);
      expect(result).toEqual(users);
    });
  });
});
