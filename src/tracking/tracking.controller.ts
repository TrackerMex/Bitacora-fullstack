import { Controller, Get } from '@nestjs/common';

@Controller('tracking')
export class TrackingController {
  @Get()
  findAll() {
    return {
      items: [],
      total: 0,
      module: 'tracking',
    };
  }
}
