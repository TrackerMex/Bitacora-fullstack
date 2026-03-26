import { Controller, Get } from '@nestjs/common';

@Controller('reports')
export class ReportsController {
  @Get()
  findAll() {
    return {
      items: [],
      total: 0,
      module: 'reports',
    };
  }
}
