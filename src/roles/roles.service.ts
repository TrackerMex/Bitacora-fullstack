import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RoleRepository } from './roles.repository';

@Injectable()
export class RolesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly roleRepository: RoleRepository,
  ) {}

  async findAllRoles(tenantId: string) {
    const roles = await this.roleRepository.listRolesWithPermissions(tenantId, {
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: roles.map((role) => ({
        id: role.id,
        key: role.key,
        name: role.name,
        description: role.description,
        isActive: role.isActive,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        permissions: role.permissions.map((rolePermission) => ({
          id: rolePermission.permission.id,
          key: rolePermission.permission.key,
          name: rolePermission.permission.name,
          module: rolePermission.permission.module,
          description: rolePermission.permission.description,
        })),
      })),
      total: roles.length,
      module: 'roles',
    };
  }

  async countRoles(tenantId: string) {
    return this.roleRepository.countRoles(tenantId);
  }

  async findAllPermissions() {
    const permissions = await this.databaseService.permission.findMany({
      orderBy: [{ module: 'asc' }, { key: 'asc' }],
    });

    return {
      items: permissions,
      total: permissions.length,
      module: 'roles',
    };
  }
}
