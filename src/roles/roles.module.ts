import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RoleRepository } from './roles.repository';
import { TenantModule } from '../tenancy/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [RolesController],
  providers: [RolesService, RoleRepository],
  exports: [RoleRepository],
})
export class RolesModule {}
