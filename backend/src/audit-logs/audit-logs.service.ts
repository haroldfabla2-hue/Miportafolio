import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
    constructor(private prisma: PrismaService) { }

    async logAction(data: { userId: string, action: string, ipAddress?: string, userAgent?: string, details?: any }) {
        try {
            // Assuming AuditLog table is named 'auditLog' in Prisma Client
            // Note: In schema it might be 'AuditLog' (Capitalized) or mapped.
            // Usually prisma.auditLog (lowerCamelCase) is the delegate.
            return await this.prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    details: data.details ? JSON.stringify(data.details) : undefined
                }
            });
        } catch (e) {
            console.error('Failed to create audit log', e);
            console.log('AUDIT_LOG_FALLBACK:', JSON.stringify(data));
        }
    }
    async findAll(limit?: number) {
        try {
            return await this.prisma.auditLog.findMany({
                take: limit || 50,
                orderBy: { timestamp: 'desc' }
            });
        } catch (e) {
            console.error('Failed to find audit logs', e);
            return [];
        }
    }

    async findByUser(userId: string, limit?: number) {
        try {
            return await this.prisma.auditLog.findMany({
                where: { userId },
                take: limit || 50,
                orderBy: { timestamp: 'desc' }
            });
        } catch (e) {
            console.error('Failed to find audit logs for user', e);
            return [];
        }
    }
}
