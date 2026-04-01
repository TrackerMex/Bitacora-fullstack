import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Find all users for a specific tenant with their roles and permissions
   * @param tenantId - The tenant ID to filter users by
   */
  async findAll(tenantId: string) {
    const users = await this.userRepository.findAllWithRoles(tenantId);

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

  /**
   * Find a user by ID within a specific tenant
   * @param tenantId - The tenant ID
   * @param userId - The user ID
   */
  async findById(tenantId: string, userId: string) {
    return this.userRepository.findById(tenantId, userId);
  }

  /**
   * Find a user by email within a specific tenant
   * @param tenantId - The tenant ID
   * @param email - The user's email
   */
  async findByEmail(tenantId: string, email: string) {
    return this.userRepository.findByEmail(tenantId, email);
  }

  /**
   * Count users for a specific tenant
   * @param tenantId - The tenant ID
   */
  async countUsers(tenantId: string) {
    return this.userRepository.countUsers(tenantId);
  }
}
