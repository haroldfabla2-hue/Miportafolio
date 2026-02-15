import { Injectable, Inject, forwardRef, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { UsersService } from '../users/users.service';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleService {
    constructor(
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,
    ) { }

    private getOAuth2Client(redirectUri?: string): OAuth2Client {
        const resolvedRedirectUri = redirectUri || this.configService.get('GOOGLE_CALLBACK_URL') || 'http://localhost:5173/admin/settings';
        console.log('[GoogleService] Creating OAuth2Client with redirectUri:', resolvedRedirectUri);

        return new google.auth.OAuth2(
            this.configService.get('GOOGLE_CLIENT_ID'),
            this.configService.get('GOOGLE_CLIENT_SECRET'),
            resolvedRedirectUri
        );
    }

    public async getAuthUrl(redirectUri?: string): Promise<string> {
        const client = this.getOAuth2Client(redirectUri);
        return client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/gmail.modify',
                'https://www.googleapis.com/auth/drive.file'
            ],
            include_granted_scopes: true,
            prompt: 'consent' // Force refresh token generation
        });
    }

    public async handleAuthCallback(userId: string, code: string, redirectUri?: string): Promise<void> {
        const client = this.getOAuth2Client(redirectUri);
        const { tokens } = await client.getToken(code);

        await this.usersService.update(userId, {
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token, // Only returned on first consent or force
            googleTokenExpiry: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
            googleConnected: true,
            googleScopes: tokens.scope?.split(' ') || []
        });
    }


    async getUserClient(userId: string): Promise<OAuth2Client> {
        const user = await this.usersService.findById(userId);

        if (!user || !user.googleRefreshToken) {
            throw new UnauthorizedException('Google account not connected or permissions revoked');
        }

        const oauth2Client = this.getOAuth2Client();
        oauth2Client.setCredentials({
            refresh_token: user.googleRefreshToken,
            access_token: user.googleAccessToken,
            // expiry_date: user.googleTokenExpiry?.getTime() 
        });

        // Setup token refresh handler to update DB
        oauth2Client.on('tokens', async (tokens) => {
            if (tokens.refresh_token) {
                // store the refresh_token in your secure persistent database
                await this.usersService.update(userId, {
                    googleRefreshToken: tokens.refresh_token,
                    googleAccessToken: tokens.access_token,
                    googleTokenExpiry: new Date(tokens.expiry_date || Date.now() + 3600 * 1000)
                });
            } else if (tokens.access_token) {
                await this.usersService.update(userId, {
                    googleAccessToken: tokens.access_token,
                    googleTokenExpiry: new Date(tokens.expiry_date || Date.now() + 3600 * 1000)
                });
            }
        });

        return oauth2Client;
    }

    async getGmailClient(userId: string) {
        const auth = await this.getUserClient(userId);
        return google.gmail({ version: 'v1', auth });
    }

    async getDriveClient(userId: string) {
        const auth = await this.getUserClient(userId);
        return google.drive({ version: 'v3', auth });
    }

    async getUserInfo(userId: string) {
        const auth = await this.getUserClient(userId);
        const oauth2 = google.oauth2({ version: 'v2', auth });
        return (await oauth2.userinfo.get()).data;
    }

    async getConnectionStatus(userId: string) {
        const user = await this.usersService.findById(userId);
        return {
            connected: !!user?.googleRefreshToken,
            email: user?.email, // Or specific google email if stored separately
            scopes: user?.googleScopes
        };
    }
}
