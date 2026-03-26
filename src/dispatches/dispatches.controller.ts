import { Controller, Get } from '@nestjs/common';

@Controller('dispatches')
export class DispatchesController {
  @Get()
  findAll() {
    return {
      items: [],
      total: 0,
      module: 'dispatches',
    };
  }
}
