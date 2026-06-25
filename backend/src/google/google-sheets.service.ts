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

    private async getDedicatedSheetsClient(): Promise<any> {
        const clientId =
            this.configService.get<string>('CONTACT_GOOGLE_CLIENT_ID') ||
            this.configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret =
            this.configService.get<string>('CONTACT_GOOGLE_CLIENT_SECRET') ||
            this.configService.get<string>('GOOGLE_CLIENT_SECRET');
        const refreshToken = this.configService.get<string>('CONTACT_GOOGLE_REFRESH_TOKEN');
        const accessToken = this.configService.get<string>('CONTACT_GOOGLE_ACCESS_TOKEN');

        if (clientId && clientSecret && refreshToken) {
            const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
            oauth2Client.setCredentials({
                refresh_token: refreshToken,
                access_token: accessToken || undefined,
            });
            return google.sheets({ version: 'v4', auth: oauth2Client });
        }
        return null;
    }

    private async getAdminSheetsClient(): Promise<any> {
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
        return null;
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

        const dateStr = new Date(lead.createdAt).toISOString();
        
        // Row schema: Fecha | Nombre | Email | Empresa | Teléfono | Fuente | Mensaje | Status | Lead ID | Pain | Volumen | ROI | Paso
        const values = [[
            dateStr,
            lead.name || '',
            lead.email || '',
            lead.company || '',
            lead.phone || '',
            lead.source || '',
            lead.notes || '',
            (lead as any).status || 'NEW',
            lead.id,
            (lead as any).operationalPain || '',
            (lead as any).monthlyVolume ? String((lead as any).monthlyVolume) : '',
            (lead as any).roiEstimate ? String((lead as any).roiEstimate) : '',
            (lead as any).qualificationStep || ''
        ]];

        let success = false;

        // 1. Try dedicated credentials
        try {
            const sheets = await this.getDedicatedSheetsClient();
            if (sheets) {
                this.logger.log(`Attempting sync for lead ${lead.id} using dedicated sheets credentials...`);
                await sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range: 'A:M',
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',
                    requestBody: { values }
                });
                this.logger.log(`Successfully synced lead ${lead.id} using dedicated sheets credentials.`);
                success = true;
            }
        } catch (error: any) {
            this.logger.warn(`Dedicated Google Sheets sync failed: ${error.message || error}. Trying admin fallback...`);
        }

        // 2. Try connected admin fallback
        if (!success) {
            try {
                const sheets = await this.getAdminSheetsClient();
                if (sheets) {
                    this.logger.log(`Attempting sync for lead ${lead.id} using connected admin fallback...`);
                    await sheets.spreadsheets.values.append({
                        spreadsheetId,
                        range: 'A:M',
                        valueInputOption: 'USER_ENTERED',
                        insertDataOption: 'INSERT_ROWS',
                        requestBody: { values }
                    });
                    this.logger.log(`Successfully synced lead ${lead.id} using connected admin credentials.`);
                    success = true;
                } else {
                    this.logger.error(`Failed to sync lead to Google Sheets: No connected admin user found.`);
                }
            } catch (error: any) {
                this.logger.error(`Failed to sync lead to Google Sheets (both methods failed): ${error.message || error}`);
            }
        }
    }
}
