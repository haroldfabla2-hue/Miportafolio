import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { GoogleService } from './google.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('google/auth')
@UseGuards(JwtAuthGuard)
export class GoogleController {
    constructor(
        private readonly googleService: GoogleService,
        private readonly usersService: UsersService
    ) { }

    @Get('status')
    async getStatus(@Req() req) {
        const status = await this.googleService.getConnectionStatus(req.user.id);

        // Infer capabilities based on scopes (simplified logic)
        const scopes = status.scopes || [];
        return {
            ...status,
            hasGmail: scopes.some(s => s.includes('gmail')),
            hasDrive: scopes.some(s => s.includes('drive')),
            hasCalendar: scopes.some(s => s.includes('calendar')),
            hasTasks: false,
            hasContacts: false,
            assignedFolder: null // TODO: Implement folder assignment logic
        };
    }

    @Get('url')
    async getAuthUrl() {
        // Generate URL for offline access with incremental scopes
        const client = this.googleService['getOAuth2Client'](); // Accessing private for now or need public method
        // Better expose a method in service
        return { url: await this.googleService.getAuthUrl() };
    }

    @Post('callback')
    async handleCallback(@Req() req, @Body() body: { code: string }) {
        await this.googleService.handleAuthCallback(req.user.id, body.code);
        return { success: true };
    }

    @Post('disconnect')
    async disconnect(@Req() req) {
        await this.usersService.update(req.user.id, {
            googleAccessToken: null,
            googleRefreshToken: null,
            googleConnected: false,
            googleScopes: []
        });
        return { success: true };
    }
}
