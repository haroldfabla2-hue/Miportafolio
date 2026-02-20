import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    userName?: string;
}

interface MessagePayload {
    channelId: string;
    content: string;
}

interface JoinChannelPayload {
    channelId: string;
}

interface TypingPayload {
    channelId: string;
    isTyping: boolean;
}

@WebSocketGateway({
    namespace: '/chat',
    cors: {
        origin: '*',
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);
    private connectedUsers: Map<string, Set<string>> = new Map(); // channelId -> Set<userId>
    private userSockets: Map<string, string> = new Map(); // socketId -> userId

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    afterInit(server: Server) {
        this.logger.log('Chat WebSocket Gateway initialized');
    }

    async handleConnection(client: AuthenticatedSocket) {
        try {
            // Extract token from handshake
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '');

            if (!token) {
                this.logger.warn(`Client ${client.id} attempted connection without token`);
                client.emit('error', { message: 'Authentication required' });
                client.disconnect();
                return;
            }

            // Verify JWT
            const secret = this.configService.get('JWT_SECRET') || 'your-jwt-secret-change-in-prod';
            const payload = this.jwtService.verify(token, { secret });

            client.userId = payload.sub;
            client.userName = payload.name || 'Unknown';
            this.userSockets.set(client.id, client.userId);

            this.logger.log(`User ${client.userName} (${client.userId}) connected via WebSocket`);

            // Notify user of successful connection
            client.emit('connected', {
                userId: client.userId,
                userName: client.userName,
                socketId: client.id
            });

        } catch (error) {
            this.logger.error(`Connection error for ${client.id}: ${error.message}`);
            client.emit('error', { message: 'Invalid token' });
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        const userId = this.userSockets.get(client.id);
        this.userSockets.delete(client.id);

        // Remove user from all channels they were in
        for (const [channelId, users] of this.connectedUsers.entries()) {
            if (userId && users.has(userId)) {
                users.delete(userId);
                this.server.to(channelId).emit('user:left', {
                    channelId,
                    userId,
                    userName: client.userName
                });
            }
        }

        this.logger.log(`User ${client.userName || 'Unknown'} disconnected`);
    }

    @SubscribeMessage('channel:join')
    async handleJoinChannel(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: JoinChannelPayload,
    ) {
        const { channelId } = payload;

        if (!client.userId) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            // Verify user has access to channel
            const channel = await this.chatService.getChannel(channelId);

            // Join the socket room
            client.join(channelId);

            // Track connected users
            if (!this.connectedUsers.has(channelId)) {
                this.connectedUsers.set(channelId, new Set());
            }
            this.connectedUsers.get(channelId)?.add(client.userId);

            // Notify others in the channel
            client.to(channelId).emit('user:joined', {
                channelId,
                userId: client.userId,
                userName: client.userName,
            });

            // Get recent messages
            const messages = await this.chatService.getMessages(channelId, 50);

            this.logger.log(`User ${client.userName} joined channel ${channelId}`);

            return {
                success: true,
                channel,
                messages: messages.reverse(), // Oldest first
                onlineUsers: Array.from(this.connectedUsers.get(channelId) || []),
            };
        } catch (error) {
            this.logger.error(`Error joining channel: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('channel:leave')
    async handleLeaveChannel(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: JoinChannelPayload,
    ) {
        const { channelId } = payload;

        client.leave(channelId);

        if (client.userId) {
            this.connectedUsers.get(channelId)?.delete(client.userId);

            client.to(channelId).emit('user:left', {
                channelId,
                userId: client.userId,
                userName: client.userName,
            });
        }

        return { success: true };
    }

    @SubscribeMessage('message:send')
    async handleSendMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: MessagePayload,
    ) {
        const { channelId, content } = payload;

        if (!client.userId) {
            return { success: false, error: 'Not authenticated' };
        }

        if (!content?.trim()) {
            return { success: false, error: 'Message cannot be empty' };
        }

        try {
            // Save message to database
            const message = await this.chatService.sendMessage(channelId, client.userId, content);

            // Broadcast to all users in the channel (including sender)
            this.server.to(channelId).emit('message:new', message);

            this.logger.log(`Message sent by ${client.userName} in channel ${channelId}`);

            return { success: true, message };
        } catch (error) {
            this.logger.error(`Error sending message: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('typing:start')
    handleTypingStart(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: TypingPayload,
    ) {
        const { channelId } = payload;

        if (client.userId) {
            client.to(channelId).emit('user:typing', {
                channelId,
                userId: client.userId,
                userName: client.userName,
                isTyping: true,
            });
        }
    }

    @SubscribeMessage('typing:stop')
    handleTypingStop(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: TypingPayload,
    ) {
        const { channelId } = payload;

        if (client.userId) {
            client.to(channelId).emit('user:typing', {
                channelId,
                userId: client.userId,
                userName: client.userName,
                isTyping: false,
            });
        }
    }

    // Utility method to emit to specific user across all their sockets
    emitToUser(userId: string, event: string, data: any) {
        for (const [socketId, uid] of this.userSockets.entries()) {
            if (uid === userId) {
                this.server.to(socketId).emit(event, data);
            }
        }
    }

    // Get online users in a channel
    getOnlineUsers(channelId: string): string[] {
        return Array.from(this.connectedUsers.get(channelId) || []);
    }
}
