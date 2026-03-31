import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { validationSchema } from './config/validation.schema';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenancy/tenant.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { DispatchesModule } from './dispatches/dispatches.module';
import { TrackingModule } from './tracking/tracking.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
      expandVariables: true,
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    TenantModule,
    UsersModule,
    RolesModule,
    DispatchesModule,
    TrackingModule,
    ReportsModule,
    NotificationsModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
