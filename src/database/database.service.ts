import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name);
  private isConnected = false;

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/tracker_bitacora';

    super({
      adapter: new PrismaPg({ connectionString }),
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      this.logger.debug('Skipping Prisma connection in test environment');
      return;
    }

    await this.$connect();
    this.isConnected = true;
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy() {
    if (!this.isConnected) {
      return;
    }

    await this.$disconnect();
    this.isConnected = false;
  }

  getStatus() {
    return {
      provider: 'postgresql',
      orm: 'prisma',
      connected: this.isConnected,
    };
  }
}
