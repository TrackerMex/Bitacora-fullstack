import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RolesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAllRoles() {
    const roles = await this.databaseService.role.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
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
