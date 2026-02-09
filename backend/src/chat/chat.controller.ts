import { Controller, Get, Post, Body, Param, Query, Req, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('channels')
    getChannels(@Req() req: any) {
        const userId = req.user?.id || 'mock-user-id';
        return this.chatService.getChannels(userId);
    }

    @Get('channels/:id')
    getChannel(@Param('id') id: string) {
        return this.chatService.getChannel(id);
    }

    @Post('channels')
    createChannel(@Body() data: { name: string; description?: string; isPrivate?: boolean; projectId?: string; memberIds?: string[] }) {
        return this.chatService.createChannel(data);
    }

    @Get('channels/:channelId/messages')
    getMessages(
        @Param('channelId') channelId: string,
        @Query('limit') limit?: string,
        @Query('before') before?: string
    ) {
        return this.chatService.getMessages(channelId, limit ? parseInt(limit) : 50, before);
    }

    @Post('channels/:channelId/messages')
    sendMessage(
        @Param('channelId') channelId: string,
        @Body() body: { content: string },
        @Req() req: any
    ) {
        const userId = req.user?.id || 'mock-user-id';
        return this.chatService.sendMessage(channelId, userId, body.content);
    }

    @Post('channels/:channelId/members')
    addMember(@Param('channelId') channelId: string, @Body() body: { userId: string }) {
        return this.chatService.addMember(channelId, body.userId);
    }

    @Delete('channels/:channelId/members/:userId')
    removeMember(@Param('channelId') channelId: string, @Param('userId') userId: string) {
        return this.chatService.removeMember(channelId, userId);
    }
}
