import { Controller, Get, Post, Delete, Body, Query, Req, UseGuards, Param, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { GoogleService } from './google.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('google/gmail')
@UseGuards(JwtAuthGuard)
export class GmailController {
    constructor(private readonly googleService: GoogleService) { }

    @Get('messages')
    async listMessages(@Req() req, @Query('maxResults') maxResults = 20, @Query('q') q = '') {
        const gmail = await this.googleService.getGmailClient(req.user.id);
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: Number(maxResults),
            q: q
        });

        const messages = response.data.messages || [];

        // Fetch details for each message to populate UI
        // In a real app, use batching or verify if frontend fetches details individually.
        // Frontend 'Email.tsx' expects full objects to map: id, threadId, from, to... 
        // So we must fetch details.

        const detailedMessages = await Promise.all(messages.map(async (msg) => {
            const detail = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'full'
            });

            // Map to simplified structure if needed, or return full payload
            // Frontend 'Email.tsx' helpers like 'parseEmailAddress' work on raw strings, 
            // but the mapping in 'fetchEmails' accesses 'msg.from', 'msg.subject'. 
            // The Gmail API returns these in 'payload.headers'. 
            // We should probably do some mapping here or let frontend handle it.
            // Looking at Email.tsx: 
            // const transformedEmails = data.map(msg => ({ ... from: parse(msg.from) ... }))
            // It expects 'msg.from' to be a string. Gmail API 'messages.get' returns 'payload.headers[]'.
            // WE MUST MAP IT HERE for the frontend to work as written.

            const headers = detail.data.payload?.headers || [];
            const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

            return {
                id: msg.id,
                threadId: msg.threadId,
                labelIds: detail.data.labelIds,
                snippet: detail.data.snippet,
                date: new Date(Number(detail.data.internalDate)).toISOString(),
                isRead: !detail.data.labelIds?.includes('UNREAD'),
                from: getHeader('From'),
                to: getHeader('To'),
                subject: getHeader('Subject'),
                // body? Frontend fetches body separately via /messages/:id usually?
                // Email.tsx: handleSelectEmail fetches /messages/:id.
                // But list needs 'snippet'.
            };
        }));

        return detailedMessages;
    }

    @Get('unread-count')
    async getUnreadCount(@Req() req) {
        const gmail = await this.googleService.getGmailClient(req.user.id);
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: 'label:UNREAD',
            includeSpamTrash: false,
            maxResults: 1 // We only need resultSizeEstimate usually, but list doesn't return count directly easily without page loops.
            // Actually 'users.labels.get' for 'UNREAD' is better.
        });

        // Better approach: Get Label details
        const labelReq = await gmail.users.labels.get({
            userId: 'me',
            id: 'UNREAD'
        });

        return { count: labelReq.data.messagesUnread || 0 };
    }

    @Get('messages/:id')
    async getMessage(@Req() req, @Param('id') id: string) {
        const gmail = await this.googleService.getGmailClient(req.user.id);
        const response = await gmail.users.messages.get({
            userId: 'me',
            id: id,
            format: 'full'
        });
        return response.data;
    }

    @Post('messages/:id/read')
    async markAsRead(@Req() req, @Param('id') id: string) {
        const gmail = await this.googleService.getGmailClient(req.user.id);
        await gmail.users.messages.modify({
            userId: 'me',
            id: id,
            requestBody: {
                removeLabelIds: ['UNREAD']
            }
        });
        return { success: true };
    }

    @Delete('messages/:id')
    async deleteMessage(@Req() req, @Param('id') id: string) {
        const gmail = await this.googleService.getGmailClient(req.user.id);
        await gmail.users.messages.trash({
            userId: 'me',
            id: id
        });
        return { success: true };
    }

    @Get('threads')
    async listThreads(@Req() req, @Query('maxResults') maxResults = 20, @Query('q') q = '') {
        const gmail = await this.googleService.getGmailClient(req.user.id);
        const response = await gmail.users.threads.list({
            userId: 'me',
            maxResults: Number(maxResults),
            q: q
        });
        return response.data;
    }

    @Get('threads/:id')
    async getThread(@Req() req, @Param('id') id: string) {
        const gmail = await this.googleService.getGmailClient(req.user.id);
        const response = await gmail.users.threads.get({
            userId: 'me',
            id: id,
            format: 'full'
        });
        return response.data;
    }

    @Post('send')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'attachments', maxCount: 5 }
    ]))
    async sendEmail(
        @Req() req,
        @Body() body: { to: string; subject: string; body: string },
        @UploadedFiles() files: { attachments?: Express.Multer.File[] }
    ) {
        const gmail = await this.googleService.getGmailClient(req.user.id);

        const utf8Subject = `=?utf-8?B?${Buffer.from(body.subject).toString('base64')}?=`;
        const messageParts = [
            `From: me`,
            `To: ${body.to}`,
            `Subject: ${utf8Subject}`,
            `Content-Type: text/html; charset=utf-8`,
            `MIME-Version: 1.0`,
            ``,
            body.body
        ];

        const rawMessage = messageParts.join('\n');
        const encodedMessage = Buffer.from(rawMessage)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        return response.data;
    }

    @Post('threads/:id/reply')
    async reply(@Req() req, @Param('id') threadId: string, @Body() body: { messageId: string, body: string, replyAll: boolean }) {
        const gmail = await this.googleService.getGmailClient(req.user.id);
        return { status: 'Not implemented in prototype', threadId };
    }

    @Post('threads/:id/modify')
    async modifyThread(@Req() req, @Param('id') id: string, @Body() body: { addLabels: string[], removeLabels: string[] }) {
        const gmail = await this.googleService.getGmailClient(req.user.id);
        const response = await gmail.users.threads.modify({
            userId: 'me',
            id: id,
            requestBody: {
                addLabelIds: body.addLabels,
                removeLabelIds: body.removeLabels
            }
        });
        return response.data;
    }
}

