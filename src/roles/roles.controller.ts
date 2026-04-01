import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  JwtAuthGuard,
  PermissionsGuard,
  Permissions,
  TenantGuard,
  Tenant,
} from '../auth';

@Controller('roles')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * List all roles with their permissions
   * Requires: roles.read permission
   */
  @Get()
  @Permissions('roles.read')
  findAllRoles(@Tenant() tenantId: string) {
    return this.rolesService.findAllRoles(tenantId);
  }

  /**
   * List all available permissions grouped by module
   * Requires: roles.read permission
   */
  @Get('permissions')
  @Permissions('roles.read')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }
}
