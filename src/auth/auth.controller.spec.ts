import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JWTAuthGuard } from './guards/auth.guard';
import { HttpStatus, HttpException } from '@nestjs/common';

describe('AuthController (Integration)', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    getUsers: jest.fn(),
    createUser: jest.fn(),
    createRole: jest.fn(),
    login: jest.fn(),
    assignRole: jest.fn(),
    deleteUser: jest.fn(),
    getRoles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        JwtService,
        PrismaService,
      ],
    })
      .overrideGuard(JWTAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // mock the guard to always pass
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  // Utility Stubs
  const getAuthUserStub = (role = 'admin') => {
    return {
      id: 'should-be-a-uuid',
      email: 'admin@test.com',
      role,
    };
  };

  const getUserStub = () => {
    return {
      "message": "Fetched all users succesfully!",
      "data": [
        {
          "id": "should-be-a-uuid",
          "firstName": 'test',
          "lastName": "test",
          "email": "test@test.com",
          "passwordHash": "$2b$10$6QWfhHOqBL2yNM.D7ube2uvyM8Ozon9Tz15j8zZssd0vchz.mu9wS",
          "createdAt": "2024-10-19T00:52:15.249Z"
        },
      ]
    }
  };

  const getRoleStub = () => {
    return {
      id: 1,
      name: 'admin',
      permissions: ['READ', 'WRITE'],
    };
  };

  const loginStub = () => {
    return {
      email: 'admin@test.com',
      password: 'password123',
    };
  };

  describe('getUsers', () => {
    it('should return a list of users', async () => {
      const users = [getUserStub()];
      mockAuthService.getUsers.mockResolvedValue(users);

      const result = await authController.getUsers({userId:"should-be-a-uuid", roles:[{name:"admin", permissions:JSON.stringify(["READ","WRITE"])}]});
      expect(result).toEqual(users);
      expect(mockAuthService.getUsers).toHaveBeenCalledWith({userId:"should-be-a-uuid", roles:[{name:"admin", permissions:JSON.stringify(["READ","WRITE"])}]},1,10); 

    });

    it('should throw an error when the user is not an admin', async () => {
      mockAuthService.getUsers.mockImplementation(() => {
        throw new HttpException(
          'Only admins can get a list of all users',
          HttpStatus.FORBIDDEN,
        );
      });

      try {
        await authController.getUsers({userId:"should-be-a-uuid", roles:[{name:"admin", permissions:JSON.stringify(["READ","WRITE"])}]});
      } catch (e) {
        expect(e.status).toEqual(HttpStatus.FORBIDDEN);
        expect(e.message).toEqual('Only admins can get a list of all users');
      }
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto = { email: 'test@test.com', firstName: 'test', lastName: 'test', password: 'password123' };
      mockAuthService.createUser.mockResolvedValue({ message: 'User successfully created!' });

      const result = await authController.createUser(createUserDto);
      expect(result).toEqual({ message: 'User successfully created!' });
      expect(mockAuthService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const loginDto = loginStub();
      const token = { access_token: 'jwt_token' };
      mockAuthService.login.mockResolvedValue(token);

      const result = await authController.login(loginDto);
      expect(result).toEqual(token);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw an error for invalid credentials', async () => {
      const loginDto = loginStub();
      mockAuthService.login.mockImplementation(() => {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      });

      try {
        await authController.login(loginDto);
      } catch (e) {
        expect(e.status).toEqual(HttpStatus.UNAUTHORIZED);
        expect(e.message).toEqual('Invalid credentials');
      }
    });
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const createRoleDto = { name: 'admin', permissions: ['READ', 'WRITE'] };
      mockAuthService.createRole.mockResolvedValue({ message: 'Role successfully created!' });

      const result = await authController.createRole(createRoleDto,{userId:"should-be-a-uuid", roles:[{name:"admin", permissions:JSON.stringify(["READ","WRITE"])}]});
      expect(result).toEqual({ message: 'Role successfully created!' });
      expect(mockAuthService.createRole).toHaveBeenCalledWith(createRoleDto, {userId:"should-be-a-uuid", roles:[{name:"admin", permissions:JSON.stringify(["READ","WRITE"])}]});
    });
  });

  describe('assignRole', () => {
    it('should assign a role to a user', async () => {
      const assignRoleDto = { id: 'should-be-a-uuid', roleId: 2 };
      mockAuthService.assignRole.mockResolvedValue({ message: 'Role successfully assigned!' });

      const result = await authController.assignRole({userId:"should-be-a-uuid", roles:[{name:"admin", permissions:JSON.stringify(["READ","WRITE"])}]}, assignRoleDto);
      expect(result).toEqual({ message: 'Role successfully assigned!' });
      expect(mockAuthService.assignRole).toHaveBeenCalledWith(assignRoleDto.id,{userId:"should-be-a-uuid", roles:[{name:"admin", permissions:JSON.stringify(["READ","WRITE"])}]}, +assignRoleDto.roleId);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const id = 'should-be-a-uuid';
      mockAuthService.deleteUser.mockResolvedValue({ message: 'User successfully deleted!' });

      const result = await authController.deleteSpecificUser(id, {userId:"should-be-a-uuid", roles:[{name:"admin", permissions:JSON.stringify(["READ","WRITE"])}]});
      expect(result).toEqual({ message: 'User successfully deleted!' });
      expect(mockAuthService.deleteUser).toHaveBeenCalledWith(id, {userId:"should-be-a-uuid", roles:[{name:"admin", permissions:JSON.stringify(["READ","WRITE"])}]});
    });

    it('should throw an error if user tries to delete their own account', async () => {
      const id = 'should-be-a-uuid';
      mockAuthService.deleteUser.mockImplementation(() => {
        throw new HttpException("You can't delete your own account", HttpStatus.FORBIDDEN);
      });

      try {
        await authController.deleteSpecificUser(id, {userId:"should-be-a-uuid", roles:[{name:"admin", permissions:JSON.stringify(["READ","WRITE"])}]});
      } catch (e) {
        expect(e.status).toEqual(HttpStatus.FORBIDDEN);
        expect(e.message).toEqual("You can't delete your own account");
      }
    });
  });

  describe('getRoles', () => {
    it('should return a list of roles', async () => {
      const roles = [getRoleStub()];
      mockAuthService.getRoles.mockResolvedValue(roles);

      const result = await authController.getRoles({userId:"should-be-a-uuid", roles:[{name:"admin", permissions:JSON.stringify(["READ","WRITE"])}]});
      expect(result).toEqual(roles);
      expect(mockAuthService.getRoles).toHaveBeenCalledWith({userId:"should-be-a-uuid", roles:[{name:"admin", permissions:JSON.stringify(["READ","WRITE"])}]},1,10); 

    });
  });
});
