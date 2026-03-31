import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard, PermissionsGuard, Permissions } from '../auth';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * List all roles with their permissions
   * Requires: roles.read permission
   */
  @Get()
  @Permissions('roles.read')
  findAllRoles() {
    return this.rolesService.findAllRoles();
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
