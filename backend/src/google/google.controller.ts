import { Controller, Get, Post, Body, Req, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { GoogleService } from './google.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { Public } from '../auth/public.decorator';
import { ConfigService } from '@nestjs/config';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';

@Controller('google/auth')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class GoogleController {
    constructor(
        private readonly googleService: GoogleService,
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService
    ) { }

    @Get('client-id')
    @Public()
    getClientId() {
        return {
            clientId: this.configService.get('GOOGLE_CLIENT_ID') || null,
        };
    }

    @Get('status')
    @RequiresPermission('dashboard:view')
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
    @RequiresPermission('dashboard:view')
    async getAuthUrl(@Req() req) {
        // Allow dynamic redirect URI from query param
        const redirectUri = req.query.redirectUri as string;
        console.log('[GoogleController] Requesting Auth URL with redirectUri:', redirectUri);
        return { url: await this.googleService.getAuthUrl(redirectUri) };
    }

    @Post('callback')
    @RequiresPermission('dashboard:view')
    async handleCallback(@Req() req, @Body() body: { code: string, redirectUri?: string }) {
        console.log('[GoogleController] Handling Callback with body:', { ...body, code: 'REDACTED' });
        await this.googleService.handleAuthCallback(req.user.id, body.code, body.redirectUri);
        return { success: true };
    }

    @Post('disconnect')
    @RequiresPermission('dashboard:view')
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
