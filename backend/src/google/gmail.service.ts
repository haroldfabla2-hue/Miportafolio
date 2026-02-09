import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface ClientMatch {
    id: string;
    name: string;
    company: string;
    status: string;
}

export interface EmailMessage {
    id: string;
    threadId: string;
    subject: string;
    from: string;
    to: string;
    date: string;
    snippet: string;
    isRead: boolean;
    client?: ClientMatch;
}

interface SendEmailOptions {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
    isHtml?: boolean;
}

@Injectable()
export class GmailService {
    // Cache email->client mappings to avoid repeated DB queries
    private clientCache = new Map<string, ClientMatch | null>();
    private cacheExpiry = 5 * 60 * 1000; // 5 minutes
    private lastCacheClean = Date.now();

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) { }

    /**
     * Match email address to CRM client
     */
    async matchEmailToClient(emailAddress: string): Promise<ClientMatch | null> {
        // Extract email from "Name <email@example.com>" format
        const match = emailAddress.match(/<(.+?)>/);
        const email = match ? match[1].toLowerCase() : emailAddress.toLowerCase();

        // Check cache first
        if (this.clientCache.has(email)) {
            return this.clientCache.get(email) || null;
        }

        // Query database
        const client = await this.prisma.client.findUnique({
            where: { email },
            select: { id: true, name: true, company: true, status: true },
        });

        const result = client ? {
            id: client.id,
            name: client.name,
            company: client.company,
            status: client.status,
        } : null;

        // Cache result
        this.clientCache.set(email, result);

        // Clean cache periodically
        if (Date.now() - this.lastCacheClean > this.cacheExpiry) {
            this.clientCache.clear();
            this.lastCacheClean = Date.now();
        }

        return result;
    }

    /**
     * Get OAuth2 client configured with user's tokens
     */
    private async getAuthenticatedClient(userId: string): Promise<OAuth2Client> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                googleAccessToken: true,
                googleRefreshToken: true,
                googleTokenExpiry: true,
                googleConnected: true,
                googleScopes: true,
            },
        });

        if (!user?.googleConnected || !user.googleAccessToken) {
            throw new UnauthorizedException('User has not connected Google account');
        }

        // Check if Gmail scope is authorized
        const hasGmailScope = user.googleScopes?.some(s =>
            s.includes('gmail') || s.includes('mail')
        );

        if (!hasGmailScope) {
            throw new UnauthorizedException('Gmail access not authorized');
        }

        const client = new google.auth.OAuth2(
            this.configService.get('GOOGLE_CLIENT_ID'),
            this.configService.get('GOOGLE_CLIENT_SECRET'),
        );

        client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken,
            expiry_date: user.googleTokenExpiry?.getTime(),
        });

        // Refresh token if expired
        if (user.googleTokenExpiry && new Date() > user.googleTokenExpiry) {
            const { credentials } = await client.refreshAccessToken();

            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    googleAccessToken: credentials.access_token,
                    googleTokenExpiry: credentials.expiry_date
                        ? new Date(credentials.expiry_date)
                        : null,
                },
            });

            client.setCredentials(credentials);
        }

        return client;
    }

    /**
     * List emails from user's Gmail inbox
     */
    async listEmails(userId: string, maxResults = 20, labelIds = ['INBOX']): Promise<EmailMessage[]> {
        const auth = await this.getAuthenticatedClient(userId);
        const gmail = google.gmail({ version: 'v1', auth });

        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults,
            labelIds,
        });

        const messages = response.data.messages || [];
        const emails: EmailMessage[] = [];

        for (const msg of messages.slice(0, maxResults)) {
            const detail = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id!,
                format: 'metadata',
                metadataHeaders: ['From', 'To', 'Subject', 'Date'],
            });

            const headers = detail.data.payload?.headers || [];
            const getHeader = (name: string) =>
                headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

            const fromEmail = getHeader('From');
            const client = await this.matchEmailToClient(fromEmail);

            emails.push({
                id: msg.id!,
                threadId: msg.threadId || '',
                subject: getHeader('Subject'),
                from: fromEmail,
                to: getHeader('To'),
                date: getHeader('Date'),
                snippet: detail.data.snippet || '',
                isRead: !detail.data.labelIds?.includes('UNREAD'),
                client: client || undefined,
            });
        }

        return emails;
    }

    /**
     * Send email from user's Gmail
     */
    async sendEmail(userId: string, options: SendEmailOptions): Promise<{ id: string; threadId: string }> {
        const auth = await this.getAuthenticatedClient(userId);
        const gmail = google.gmail({ version: 'v1', auth });

        // Get user's email for From header
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });

        const fromAddress = user?.name ? `${user.name} <${user.email}>` : user?.email;

        // Build email
        const emailLines = [
            `From: ${fromAddress}`,
            `To: ${options.to}`,
            options.cc ? `Cc: ${options.cc}` : '',
            options.bcc ? `Bcc: ${options.bcc}` : '',
            `Subject: ${options.subject}`,
            `Content-Type: ${options.isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`,
            '',
            options.body,
        ].filter(Boolean).join('\r\n');

        // Encode to base64url
        const encodedEmail = Buffer.from(emailLines)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedEmail,
            },
        });

        return {
            id: response.data.id || '',
            threadId: response.data.threadId || '',
        };
    }

    /**
     * Get single email with full body
     */
    async getEmail(userId: string, messageId: string): Promise<any> {
        const auth = await this.getAuthenticatedClient(userId);
        const gmail = google.gmail({ version: 'v1', auth });

        const response = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full',
        });

        return response.data;
    }

    /**
     * Mark email as read
     */
    async markAsRead(userId: string, messageId: string): Promise<void> {
        const auth = await this.getAuthenticatedClient(userId);
        const gmail = google.gmail({ version: 'v1', auth });

        await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                removeLabelIds: ['UNREAD'],
            },
        });
    }

    /**
     * Delete email
     */
    async deleteEmail(userId: string, messageId: string): Promise<void> {
        const auth = await this.getAuthenticatedClient(userId);
        const gmail = google.gmail({ version: 'v1', auth });

        await gmail.users.messages.trash({
            userId: 'me',
            id: messageId,
        });
    }

    /**
     * Get unread count
     */
    async getUnreadCount(userId: string): Promise<number> {
        const auth = await this.getAuthenticatedClient(userId);
        const gmail = google.gmail({ version: 'v1', auth });

        const response = await gmail.users.labels.get({
            userId: 'me',
            id: 'INBOX',
        });

        return response.data.messagesUnread || 0;
    }

    /**
     * Check if user has Gmail connected
     */
    async isGmailConnected(userId: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { googleConnected: true, googleScopes: true },
        });

        if (!user?.googleConnected) return false;

        return user.googleScopes?.some(s =>
            s.includes('gmail') || s.includes('mail')
        ) || false;
    }
}
