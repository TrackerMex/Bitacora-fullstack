import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Public } from '../auth';

@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Health check endpoint - Public, no authentication required
   */
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'tracker-bitacora-api',
      database: this.databaseService.getStatus(),
    };
  }
}
