import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleService } from './google.service';

@Injectable()
export class GoogleSheetsService {
    private readonly logger = new Logger(GoogleSheetsService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly googleService: GoogleService,
    ) {}

    private async getSheetsClient(): Promise<any> {
        // Try dedicated CONTACT_GOOGLE_* credentials first
        const clientId =
            this.configService.get<string>('CONTACT_GOOGLE_CLIENT_ID') ||
            this.configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret =
            this.configService.get<string>('CONTACT_GOOGLE_CLIENT_SECRET') ||
            this.configService.get<string>('GOOGLE_CLIENT_SECRET');
        const refreshToken = this.configService.get<string>('CONTACT_GOOGLE_REFRESH_TOKEN');
        const accessToken = this.configService.get<string>('CONTACT_GOOGLE_ACCESS_TOKEN');

        if (clientId && clientSecret && refreshToken) {
            try {
                this.logger.log('Attempting to use dedicated Google OAuth credentials for Google Sheets.');
                const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
                oauth2Client.setCredentials({
                    refresh_token: refreshToken,
                    access_token: accessToken || undefined,
                });
                return google.sheets({ version: 'v4', auth: oauth2Client });
            } catch (error: any) {
                this.logger.warn(`Failed to initialize dedicated Google Sheets client: ${error.message || error}`);
            }
        }

        // Fallback: Try connected admin user
        try {
            this.logger.log('Fallback: Attempting to find a connected Admin user for Google Sheets.');
            const admin = await this.prisma.user.findFirst({
                where: {
                    role: { in: ['SUPER_ADMIN', 'ADMIN'] },
                    googleConnected: true,
                },
                select: { id: true, email: true },
                orderBy: { createdAt: 'asc' },
            });

            if (admin) {
                this.logger.log(`Using credentials of connected admin: ${admin.email}`);
                const auth = await this.googleService.getUserClient(admin.id);
                return google.sheets({ version: 'v4', auth });
            }
        } catch (error: any) {
            this.logger.warn(`Failed to initialize admin fallback Google Sheets client: ${error.message || error}`);
        }

        throw new Error('No valid Google credentials available for Google Sheets sync');
    }

    async appendLeadRow(lead: {
        id: string;
        name: string;
        email: string;
        company: string | null;
        phone: string | null;
        source: string | null;
        notes: string | null;
        createdAt: Date | string;
    }) {
        const spreadsheetId =
            this.configService.get<string>('LEADS_SPREADSHEET_ID') ||
            '1XGfE6N7A00L0P3NPaqrXhbcWLOuB4B-Dx-9BQTacTck';

        try {
            const sheets = await this.getSheetsClient();
            const dateStr = new Date(lead.createdAt).toISOString();
            
            // Row schema: Fecha | Nombre | Email | Empresa | Teléfono | Fuente | Mensaje | Status | Lead ID
            const values = [[
                dateStr,
                lead.name || '',
                lead.email || '',
                lead.company || '',
                lead.phone || '',
                lead.source || '',
                lead.notes || '',
                'NEW',
                lead.id
            ]];

            this.logger.log(`Syncing lead ${lead.id} to Google Sheet ${spreadsheetId}`);
            
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: 'A:I',
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                requestBody: {
                    values,
                },
            });
            this.logger.log(`Successfully synced lead ${lead.id} to Google Sheets.`);
        } catch (error: any) {
            this.logger.error(`Failed to sync lead to Google Sheets: ${error.message || error}`);
        }
    }
}
