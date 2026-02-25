import { Controller, Get, Post, Body, Param, Query, Req, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('channels')
    @RequiresPermission('messages:access')
    getChannels(@Req() req: any) {
        return this.chatService.getChannels(req.user);
    }

    @Get('channels/:id')
    @RequiresPermission('messages:access')
    getChannel(@Param('id') id: string, @Req() req: any) {
        return this.chatService.getChannel(id, req.user);
    }

    @Post('channels')
    @RequiresPermission('messages:access')
    createChannel(
        @Body() data: { name: string; description?: string; isPrivate?: boolean; projectId?: string; memberIds?: string[] },
        @Req() req: any
    ) {
        return this.chatService.createChannel(data, req.user);
    }

    @Get('channels/:channelId/messages')
    @RequiresPermission('messages:access')
    getMessages(
        @Param('channelId') channelId: string,
        @Query('limit') limit?: string,
        @Query('before') before?: string,
        @Req() req?: any
    ) {
        return this.chatService.getMessages(channelId, req.user, limit ? parseInt(limit) : 50, before);
    }

    @Post('channels/:channelId/messages')
    @RequiresPermission('messages:access')
    sendMessage(
        @Param('channelId') channelId: string,
        @Body() body: { content: string },
        @Req() req: any
    ) {
        return this.chatService.sendMessage(channelId, req.user, body.content);
    }

    @Post('channels/:channelId/members')
    @RequiresPermission('messages:access')
    addMember(@Param('channelId') channelId: string, @Body() body: { userId: string }, @Req() req: any) {
        return this.chatService.addMember(channelId, body.userId, req.user);
    }

    @Delete('channels/:channelId/members/:userId')
    @RequiresPermission('messages:access')
    removeMember(@Param('channelId') channelId: string, @Param('userId') userId: string, @Req() req: any) {
        return this.chatService.removeMember(channelId, userId, req.user);
    }
}
