import { Controller, Get, Put, Body, Param, Req, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    findAll(@Req() req: any) {
        return this.notificationsService.findAll(req.user);
    }

    @Get('unread')
    findUnread(@Req() req: any) {
        return this.notificationsService.findUnread(req.user);
    }

    @Put(':id/read')
    markAsRead(@Param('id') id: string, @Req() req: any) {
        return this.notificationsService.markAsRead(id, req.user);
    }

    @Put('read-all')
    markAllAsRead(@Req() req: any) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }

    @Delete()
    deleteAll(@Req() req: any) {
        return this.notificationsService.deleteAll(req.user.id);
    }

    // Internal use or admin only ideally, but exposing for now to test
    @Post()
    create(@Body() data: { userId: string, title: string, message: string, type?: string }) {
        return this.notificationsService.create(data);
    }
}
