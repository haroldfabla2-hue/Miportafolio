import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';

interface AuthenticatedSocket extends Socket {
    userId?: string;
}

@WebSocketGateway({
    namespace: '/notifications',
    cors: {
        origin: '*',
    },
})
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('NotificationsGateway');
    private userSockets: Map<string, Set<string>> = new Map();

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        @Inject(forwardRef(() => NotificationsService))
        private notificationsService: NotificationsService,
    ) { }

    afterInit(server: Server) {
        this.logger.log('Notifications WebSocket Gateway Initialized');
    }

    async handleConnection(client: AuthenticatedSocket) {
        try {
            const token =
                client.handshake.auth?.token || client.handshake.headers['authorization'];

            if (!token) {
                return client.disconnect();
            }

            const jwt = token.replace('Bearer ', '');
            const payload = this.jwtService.verify(jwt, {
                secret: this.configService.get('JWT_SECRET'),
            });

            const userId = payload.sub;
            client.userId = userId;
            await client.join(`user:${userId}`);

            // Track sockets per user
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId)?.add(client.id);

            // Send unread count on connect
            const unreadCount = await this.notificationsService.getUnreadCount(userId);
            client.emit('notifications:count', { unread: unreadCount });

            this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
        } catch (err) {
            this.logger.warn(`Connection rejected: ${err.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        if (client.userId) {
            this.userSockets.get(client.userId)?.delete(client.id);
            if (this.userSockets.get(client.userId)?.size === 0) {
                this.userSockets.delete(client.userId);
            }
        }
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('notifications:markRead')
    async handleMarkRead(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: { notificationId: string },
    ) {
        if (!client.userId) return { success: false };

        try {
            await this.notificationsService.markAsRead(payload.notificationId, client.userId);
            const unreadCount = await this.notificationsService.getUnreadCount(client.userId);
            this.sendToUser(client.userId, 'notifications:count', { unread: unreadCount });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('notifications:markAllRead')
    async handleMarkAllRead(@ConnectedSocket() client: AuthenticatedSocket) {
        if (!client.userId) return { success: false };

        try {
            await this.notificationsService.markAllAsRead(client.userId);
            this.sendToUser(client.userId, 'notifications:count', { unread: 0 });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Send notification to specific user
    sendToUser(userId: string, event: string, data: any) {
        this.server.to(`user:${userId}`).emit(event, data);
    }

    // Send new notification and update count
    async pushNotification(userId: string, notification: any) {
        this.server.to(`user:${userId}`).emit('notification:new', notification);
        const unreadCount = await this.notificationsService.getUnreadCount(userId);
        this.server.to(`user:${userId}`).emit('notifications:count', { unread: unreadCount });
    }

    // Broadcast to multiple users
    async broadcastNotification(userIds: string[], notification: any) {
        for (const userId of userIds) {
            await this.pushNotification(userId, notification);
        }
    }

    isUserOnline(userId: string): boolean {
        return (this.userSockets.get(userId)?.size || 0) > 0;
    }
}

