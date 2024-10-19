import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JWTStrategy } from './strategies/auth.strategy';
@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JWTStrategy],
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'INSECURE',
      signOptions: {
        expiresIn: '2d',
      },
    }),
    PassportModule,
  ],
  exports: [AuthService],
})
export class AuthModule {}
