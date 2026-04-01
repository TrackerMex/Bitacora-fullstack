import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  JwtAuthGuard,
  PermissionsGuard,
  Permissions,
  TenantGuard,
  Tenant,
} from '../auth';

@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * List all users with their roles and permissions
   * Requires: users.read permission
   */
  @Get()
  @Permissions('users.read')
  findAll(@Tenant() tenantId: string) {
    return this.usersService.findAll(tenantId);
  }
}
