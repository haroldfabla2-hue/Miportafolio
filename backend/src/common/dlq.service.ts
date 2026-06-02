import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DLQMessage {
    id: string;
    topic: string; // 'email', 'webhook', etc.
    payload: any;
    error: string;
    retryCount: number;
    createdAt: number;
}

/**
 * Resilient Dead Letter Queue (DLQ)
 * Captures failed critical operations (like emails) and stores them for retry/audit.
 */
@Injectable()
export class DLQService {
    private readonly logger = new Logger(DLQService.name);
    private readonly memoryQueue: Map<string, DLQMessage> = new Map();

    constructor(private prisma: PrismaService) {}

    async pushToDLQ(topic: string, payload: any, error: string) {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const msg: DLQMessage = {
            id,
            topic,
            payload,
            error,
            retryCount: 0,
            createdAt: Date.now()
        };

        this.memoryQueue.set(id, msg);
        this.logger.warn(`[DLQ] Message sent to Dead Letter Queue [Topic: ${topic}]. ID: ${id}`);

        // Also persist to audit logs so it survives restarts
        try {
            // Using system superadmin or 00000000-0000-0000-0000-000000000000 for system logs
            const systemUserId = await this.getSystemUserId();
            if (systemUserId) {
                await this.prisma.auditLog.create({
                    data: {
                        action: `DLQ_PUSH_${topic.toUpperCase()}`,
                        details: { payload, error },
                        userId: systemUserId
                    }
                });
            }
        } catch (e) {
            this.logger.error('[DLQ] Failed to persist DLQ message to AuditLog', e);
        }
    }

    private async getSystemUserId(): Promise<string | null> {
        // Fallback to finding the first SUPER_ADMIN to attach system logs
        const admin = await this.prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' }
        });
        return admin ? admin.id : null;
    }

    getQueueDetails() {
        return Array.from(this.memoryQueue.values());
    }

    clearQueue() {
        this.memoryQueue.clear();
    }
}
