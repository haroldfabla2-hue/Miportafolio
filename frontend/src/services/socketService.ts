import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SocketService {
    private chatSocket: Socket | null = null;
    private notificationsSocket: Socket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();

    // Chat Socket
    connectChat() {
        if (this.chatSocket?.connected) return this.chatSocket;

        const token = localStorage.getItem('iris_token');
        if (!token) {
            console.warn('No token available for chat socket');
            return null;
        }

        this.chatSocket = io(`${API_BASE_URL}/chat`, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.chatSocket.on('connect', () => {
            console.log('Chat socket connected');
            this.emit('chat:connected', { socketId: this.chatSocket?.id });
        });

        this.chatSocket.on('disconnect', (reason) => {
            console.log('Chat socket disconnected:', reason);
            this.emit('chat:disconnected', { reason });
        });

        this.chatSocket.on('error', (error) => {
            console.error('Chat socket error:', error);
            this.emit('chat:error', error);
        });

        // Forward all chat events
        const chatEvents = ['message:new', 'user:joined', 'user:left', 'user:typing'];
        chatEvents.forEach(event => {
            this.chatSocket?.on(event, (data) => this.emit(event, data));
        });

        return this.chatSocket;
    }

    disconnectChat() {
        this.chatSocket?.disconnect();
        this.chatSocket = null;
    }

    // Chat methods
    joinChannel(channelId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.chatSocket?.connected) {
                this.connectChat();
            }
            this.chatSocket?.emit('channel:join', { channelId }, (response: any) => {
                if (response.success) {
                    resolve(response);
                } else {
                    reject(new Error(response.error || 'Failed to join channel'));
                }
            });
        });
    }

    leaveChannel(channelId: string) {
        this.chatSocket?.emit('channel:leave', { channelId });
    }

    sendMessage(channelId: string, content: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.chatSocket?.emit('message:send', { channelId, content }, (response: any) => {
                if (response.success) {
                    resolve(response.message);
                } else {
                    reject(new Error(response.error || 'Failed to send message'));
                }
            });
        });
    }

    startTyping(channelId: string) {
        this.chatSocket?.emit('typing:start', { channelId });
    }

    stopTyping(channelId: string) {
        this.chatSocket?.emit('typing:stop', { channelId });
    }

    // Notifications Socket
    connectNotifications() {
        if (this.notificationsSocket?.connected) return this.notificationsSocket;

        const token = localStorage.getItem('iris_token');
        if (!token) return null;

        this.notificationsSocket = io(`${API_BASE_URL}/notifications`, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
        });

        this.notificationsSocket.on('connect', () => {
            console.log('Notifications socket connected');
        });

        // Forward notification events
        const notifEvents = ['notification:new', 'notifications:count'];
        notifEvents.forEach(event => {
            this.notificationsSocket?.on(event, (data) => this.emit(event, data));
        });

        return this.notificationsSocket;
    }

    disconnectNotifications() {
        this.notificationsSocket?.disconnect();
        this.notificationsSocket = null;
    }

    markNotificationRead(notificationId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.notificationsSocket?.emit('notifications:markRead', { notificationId }, (response: any) => {
                if (response.success) resolve();
                else reject(new Error(response.error));
            });
        });
    }

    markAllNotificationsRead(): Promise<void> {
        return new Promise((resolve) => {
            this.notificationsSocket?.emit('notifications:markAllRead', {}, () => resolve());
        });
    }

    // Event system
    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback);
        return () => this.off(event, callback);
    }

    off(event: string, callback: Function) {
        this.listeners.get(event)?.delete(callback);
    }

    private emit(event: string, data: any) {
        this.listeners.get(event)?.forEach(cb => cb(data));
    }

    // Connect all sockets
    connectAll() {
        this.connectChat();
        this.connectNotifications();
    }

    // Disconnect all sockets
    disconnectAll() {
        this.disconnectChat();
        this.disconnectNotifications();
    }
}

export const socketService = new SocketService();
export default socketService;
