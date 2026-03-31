import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies';
import {
  JwtAuthGuard,
  RolesGuard,
  PermissionsGuard,
  TenantGuard,
} from './guards';
import { TenantModule } from '../tenancy/tenant.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: 900, // 15 minutes in seconds (default)
        },
      }),
      inject: [ConfigService],
    }),
    TenantModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    TenantGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    TenantGuard,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}
