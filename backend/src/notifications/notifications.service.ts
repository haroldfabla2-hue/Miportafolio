import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => NotificationsGateway))
        private notificationsGateway: NotificationsGateway
    ) { }

    async findAll(user: any) {
        return this.prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }

    async findUnread(user: any) {
        return this.prisma.notification.findMany({
            where: {
                userId: user.id,
                read: false
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.prisma.notification.count({
            where: {
                userId,
                read: false
            }
        });
    }

    async markAsRead(notificationId: string, userId: string) {
        return this.prisma.notification.update({
            where: { id: notificationId, userId },
            data: { read: true }
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
    }

    async deleteAll(userId: string) {
        return this.prisma.notification.deleteMany({
            where: { userId }
        });
    }

    async create(data: { userId: string, title: string, message: string, type?: string, entityType?: string, entityId?: string }) {
        const notification = await this.prisma.notification.create({
            data: {
                ...data,
                read: false
            }
        });

        // Push to WebSocket
        await this.notificationsGateway.pushNotification(data.userId, notification);

        return notification;
    }
}

