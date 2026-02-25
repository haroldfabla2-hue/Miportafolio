import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadStatus } from '@prisma/client';
import { GmailService } from '../google/gmail.service';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class LeadsService {
    private readonly logger = new Logger(LeadsService.name);

    constructor(
        private prisma: PrismaService,
        private gmailService: GmailService,
        private configService: ConfigService,
    ) { }

    async findAll() {
        return this.prisma.lead.findMany({
            include: {
                assignedTo: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByStatus(status: LeadStatus) {
        return this.prisma.lead.findMany({
            where: { status },
            include: {
                assignedTo: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: {
                assignedTo: true,
            },
        });
        if (!lead) throw new NotFoundException('Lead not found');
        return lead;
    }

    async create(data: any) {
        const lead = await this.prisma.lead.create({
            data: {
                name: data.name || data.contactName,
                company: data.company,
                email: data.email,
                phone: data.phone,
                value: data.value || 0,
                status: data.status || 'NEW',
                source: data.source,
                notes: data.notes,
                assignedToId: data.assignedToId,
            },
            include: {
                assignedTo: { select: { id: true, name: true } },
            },
        });

        // Keep lead capture resilient: email notification should never break form submission.
        this.notifyLeadByEmail(lead).catch((error) => {
            this.logger.warn(`Lead email notification failed for lead ${lead.id}: ${error?.message || error}`);
        });

        return lead;
    }

    async update(id: string, data: any) {
        return this.prisma.lead.update({
            where: { id },
            data,
            include: {
                assignedTo: { select: { id: true, name: true } },
            },
        });
    }

    async updateStatus(id: string, status: string) {
        return this.prisma.lead.update({
            where: { id },
            data: {
                status: status as LeadStatus,
            },
            include: {
                assignedTo: { select: { id: true, name: true } },
            },
        });
    }

    async delete(id: string) {
        return this.prisma.lead.delete({ where: { id } });
    }

    async getStats() {
        const leads = await this.prisma.lead.findMany();

        const byStatus = leads.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);

        return {
            total: leads.length,
            byStatus,
            totalValue,
            won: leads.filter(l => l.status === 'WON').length,
            lost: leads.filter(l => l.status === 'LOST').length,
        };
    }

    private async notifyLeadByEmail(lead: {
        id: string;
        name: string;
        email: string;
        company: string | null;
        phone: string | null;
        source: string | null;
        notes: string | null;
        createdAt: Date;
    }) {
        if (lead.source !== 'WEBSITE') return;

        const recipientEmail =
            this.configService.get<string>('CONTACT_NOTIFICATION_EMAIL') ||
            this.configService.get<string>('OWNER_EMAIL') ||
            'alberto.farah.b@gmail.com';

        const subject = `Nuevo lead web: ${lead.name || 'Sin nombre'} (${lead.email || 'sin email'})`;
        const createdAt = new Date(lead.createdAt).toISOString();

        const htmlBody = `
<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
  <h2 style="margin-bottom:12px;">Nuevo contacto desde albertofarah.com</h2>
  <p><strong>Nombre:</strong> ${this.escapeHtml(lead.name || '')}</p>
  <p><strong>Email:</strong> ${this.escapeHtml(lead.email || '')}</p>
  <p><strong>Empresa:</strong> ${this.escapeHtml(lead.company || '-')}</p>
  <p><strong>Teléfono:</strong> ${this.escapeHtml(lead.phone || '-')}</p>
  <p><strong>Fuente:</strong> ${this.escapeHtml(lead.source || '-')}</p>
  <p><strong>Mensaje:</strong><br>${this.escapeHtml(lead.notes || '-').replace(/\n/g, '<br>')}</p>
  <hr style="margin:16px 0;border:none;border-top:1px solid #ddd;">
  <p style="color:#666;font-size:12px;">Lead ID: ${lead.id} | Fecha UTC: ${createdAt}</p>
</div>`;

        const textBody = [
            'Nuevo contacto desde albertofarah.com',
            '',
            `Nombre: ${lead.name || ''}`,
            `Email: ${lead.email || ''}`,
            `Empresa: ${lead.company || '-'}`,
            `Telefono: ${lead.phone || '-'}`,
            `Fuente: ${lead.source || '-'}`,
            `Mensaje: ${lead.notes || '-'}`,
            `Lead ID: ${lead.id}`,
            `Fecha UTC: ${createdAt}`,
        ].join('\n');

        if (await this.sendViaDedicatedGoogleOAuth(recipientEmail, subject, htmlBody)) {
            return;
        }

        if (await this.sendViaConnectedAdmin(recipientEmail, subject, htmlBody)) {
            return;
        }

        this.logger.warn(
            `Lead notification not sent for ${lead.id}. Configure CONTACT_GOOGLE_* env vars or connect a Google account for an ADMIN/SUPER_ADMIN user.`,
        );
    }

    private async sendViaDedicatedGoogleOAuth(to: string, subject: string, htmlBody: string): Promise<boolean> {
        const clientId =
            this.configService.get<string>('CONTACT_GOOGLE_CLIENT_ID') ||
            this.configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret =
            this.configService.get<string>('CONTACT_GOOGLE_CLIENT_SECRET') ||
            this.configService.get<string>('GOOGLE_CLIENT_SECRET');
        const refreshToken = this.configService.get<string>('CONTACT_GOOGLE_REFRESH_TOKEN');
        const accessToken = this.configService.get<string>('CONTACT_GOOGLE_ACCESS_TOKEN');
        const senderEmail = this.configService.get<string>('CONTACT_GOOGLE_SENDER_EMAIL') || to;

        if (!clientId || !clientSecret || !refreshToken) {
            return false;
        }

        try {
            const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
            oauth2Client.setCredentials({
                refresh_token: refreshToken,
                access_token: accessToken || undefined,
            });

            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

            const emailLines = [
                `From: ${senderEmail}`,
                `To: ${to}`,
                `Subject: ${subject}`,
                'Content-Type: text/html; charset=utf-8',
                '',
                htmlBody,
            ];

            const raw = Buffer.from(emailLines.join('\r\n'))
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            await gmail.users.messages.send({
                userId: 'me',
                requestBody: { raw },
            });

            this.logger.log(`Lead notification sent via CONTACT_GOOGLE_* to ${to}`);
            return true;
        } catch (error: any) {
            this.logger.warn(`CONTACT_GOOGLE_* email send failed: ${error?.message || error}`);
            return false;
        }
    }

    private async sendViaConnectedAdmin(to: string, subject: string, htmlBody: string): Promise<boolean> {
        try {
            const sender = await this.prisma.user.findFirst({
                where: {
                    role: { in: ['SUPER_ADMIN', 'ADMIN'] },
                    googleConnected: true,
                },
                select: {
                    id: true,
                    email: true,
                },
                orderBy: { createdAt: 'asc' },
            });

            if (!sender) {
                return false;
            }

            await this.gmailService.sendEmail(sender.id, {
                to,
                subject,
                body: htmlBody,
                isHtml: true,
            });

            this.logger.log(`Lead notification sent via connected admin ${sender.email} to ${to}`);
            return true;
        } catch (error: any) {
            this.logger.warn(`Connected admin Gmail send failed: ${error?.message || error}`);
            return false;
        }
    }

    private escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
