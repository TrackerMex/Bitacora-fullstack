import { Controller, Get } from '@nestjs/common';

@Controller('integrations')
export class IntegrationsController {
  @Get()
  findAll() {
    return {
      providers: ['google-sheets'],
      module: 'integrations',
    };
  }
}
