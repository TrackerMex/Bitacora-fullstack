import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    const users = await this.databaseService.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      items: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles: user.roles.map((userRole) => ({
          id: userRole.role.id,
          key: userRole.role.key,
          name: userRole.role.name,
          description: userRole.role.description,
          permissions: userRole.role.permissions.map((rolePermission) => ({
            id: rolePermission.permission.id,
            key: rolePermission.permission.key,
            name: rolePermission.permission.name,
            module: rolePermission.permission.module,
            description: rolePermission.permission.description,
          })),
        })),
      })),
      total: users.length,
      module: 'users',
    };
  }
}
