import { Controller, Get } from '@nestjs/common';

@Controller('notifications')
export class NotificationsController {
  @Get()
  findAll() {
    return {
      items: [],
      unread: 0,
      module: 'notifications',
    };
  }
}
