import { Controller, Get, Put, Body, Param, Req, Post, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @RequiresPermission('dashboard:view')
    findAll(@Req() req: any) {
        return this.notificationsService.findAll(req.user);
    }

    @Get('unread')
    @RequiresPermission('dashboard:view')
    findUnread(@Req() req: any) {
        return this.notificationsService.findUnread(req.user);
    }

    @Put(':id/read')
    @RequiresPermission('dashboard:view')
    markAsRead(@Param('id') id: string, @Req() req: any) {
        return this.notificationsService.markAsRead(id, req.user.id);
    }

    @Put('read-all')
    @RequiresPermission('dashboard:view')
    markAllAsRead(@Req() req: any) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }

    @Delete()
    @RequiresPermission('dashboard:view')
    deleteAll(@Req() req: any) {
        return this.notificationsService.deleteAll(req.user.id);
    }

    // Internal use or admin only ideally, but exposing for now to test
    @Post()
    @RequiresPermission('settings:manage')
    create(@Body() data: { userId: string, title: string, message: string, type?: string }) {
        return this.notificationsService.create(data);
    }
}
