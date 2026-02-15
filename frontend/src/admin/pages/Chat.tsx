import React, { useState, useEffect, useRef, useCallback } from 'react';
import { authFetch } from '../../services/api';
import socketService from '../../services/socketService';

// Types
interface Channel {
    id: string;
    name: string;
    description: string | null;
    isPrivate: boolean;
    unreadCount?: number;
    lastMessage?: {
        content: string;
        sender: string;
        timestamp: string;
    };
}

interface Message {
    id: string;
    content: string;
    sender: {
        id: string;
        name: string;
        avatar: string | null;
    };
    createdAt: string;
    isSystem: boolean;
}

// Channel List Sidebar
const ChannelList: React.FC<{
    channels: Channel[];
    activeChannel: string | null;
    onSelectChannel: (id: string) => void;
}> = ({ channels, activeChannel, onSelectChannel }) => (
    <div style={{
        width: '280px',
        borderRight: '1px solid var(--admin-border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    }}>
        {/* Header */}
        <div style={{
            padding: '1rem',
            borderBottom: '1px solid var(--admin-border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Channels</h3>
            <button className="admin-btn admin-btn-ghost" style={{ padding: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>
        </div>

        {/* Channel List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {channels.map(channel => (
                <div
                    key={channel.id}
                    onClick={() => onSelectChannel(channel.id)}
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        marginBottom: '0.25rem',
                        background: activeChannel === channel.id ? 'var(--color-accent)' : 'transparent',
                        color: activeChannel === channel.id ? '#000' : '#ccc',
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {channel.isPrivate ? '🔒' : '#'} {channel.name}
                        </span>
                        {channel.unreadCount && channel.unreadCount > 0 && (
                            <span style={{
                                background: activeChannel === channel.id ? '#000' : 'var(--color-accent)',
                                color: activeChannel === channel.id ? 'var(--color-accent)' : '#000',
                                padding: '0.1rem 0.5rem',
                                borderRadius: '10px',
                                fontSize: '0.7rem',
                                fontWeight: 700
                            }}>
                                {channel.unreadCount}
                            </span>
                        )}
                    </div>
                    {channel.lastMessage && (
                        <p style={{
                            fontSize: '0.75rem',
                            opacity: 0.7,
                            marginTop: '0.25rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {channel.lastMessage.content}
                        </p>
                    )}
                </div>
            ))}
        </div>
    </div>
);

// Message Bubble
const MessageBubble: React.FC<{ message: Message; isOwn: boolean }> = ({ message, isOwn }) => {
    if (message.isSystem) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '0.5rem',
                color: '#666',
                fontSize: '0.75rem'
            }}>
                {message.content}
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1rem',
            flexDirection: isOwn ? 'row-reverse' : 'row'
        }}>
            <img
                src={message.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.name}`}
                alt={message.sender.name}
                style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }}
            />
            <div style={{ maxWidth: '60%' }}>
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'baseline',
                    marginBottom: '0.25rem',
                    flexDirection: isOwn ? 'row-reverse' : 'row'
                }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>
                        {message.sender.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#666' }}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div style={{
                    background: isOwn ? 'var(--color-accent)' : 'var(--admin-hover-bg)',
                    color: isOwn ? '#000' : '#fff',
                    padding: '0.75rem 1rem',
                    borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                }}>
                    {message.content}
                </div>
            </div>
        </div>
    );
};

// Chat View
const ChatPage: React.FC = () => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeChannel, setActiveChannel] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true); void loading;
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Get current user from localStorage
    const currentUserId = localStorage.getItem('iris_user_id') || 'user-1';

    // WebSocket connection and event handlers
    useEffect(() => {
        // Connect to chat socket
        socketService.connectChat();

        // Listen for connection status
        const unsubConnect = socketService.on('chat:connected', () => setIsConnected(true));
        const unsubDisconnect = socketService.on('chat:disconnected', () => setIsConnected(false));

        // Listen for new messages
        const unsubMessage = socketService.on('message:new', (msg: Message) => {
            setMessages(prev => [...prev.filter(m => !m.id.startsWith('temp-')), msg]);
        });

        // Listen for typing indicators
        const unsubTyping = socketService.on('user:typing', (data: { userName: string; isTyping: boolean }) => {
            setTypingUsers(prev =>
                data.isTyping
                    ? [...prev.filter(u => u !== data.userName), data.userName]
                    : prev.filter(u => u !== data.userName)
            );
        });

        // Listen for user join/leave
        const unsubJoin = socketService.on('user:joined', (data: { userName: string }) => {
            setOnlineUsers(prev => [...new Set([...prev, data.userName])]);
        });
        const unsubLeave = socketService.on('user:left', (data: { userId: string }) => {
            setOnlineUsers(prev => prev.filter(id => id !== data.userId));
        });

        fetchChannels();

        return () => {
            unsubConnect();
            unsubDisconnect();
            unsubMessage();
            unsubTyping();
            unsubJoin();
            unsubLeave();
            socketService.disconnectChat();
        };
    }, []);

    // Join channel via WebSocket when active channel changes
    useEffect(() => {
        if (activeChannel) {
            socketService.joinChannel(activeChannel)
                .then(response => {
                    if (response.messages) setMessages(response.messages);
                    if (response.onlineUsers) setOnlineUsers(response.onlineUsers);
                })
                .catch(err => {
                    console.warn('WebSocket join failed, falling back to REST:', err);
                    fetchMessages(activeChannel);
                });
        }
        return () => {
            if (activeChannel) socketService.leaveChannel(activeChannel);
        };
    }, [activeChannel]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchChannels = async () => {
        try {
            const response = await authFetch('/api/chat/channels');
            if (response.ok) {
                const data = await response.json();
                setChannels(data);
                if (data.length > 0) setActiveChannel(data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (channelId: string) => {
        try {
            const response = await authFetch(`/api/chat/channels/${channelId}/messages`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const handleTyping = useCallback(() => {
        if (!activeChannel) return;
        socketService.startTyping(activeChannel);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketService.stopTyping(activeChannel);
        }, 2000);
    }, [activeChannel]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeChannel) return;

        // Stop typing indicator
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socketService.stopTyping(activeChannel);

        // Optimistic update
        const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            content: newMessage,
            sender: { id: currentUserId, name: 'You', avatar: null },
            createdAt: new Date().toISOString(),
            isSystem: false
        };
        setMessages(prev => [...prev, tempMessage]);
        const messageToSend = newMessage;
        setNewMessage('');

        try {
            // Try WebSocket first
            await socketService.sendMessage(activeChannel, messageToSend);
        } catch (error) {
            // Fallback to REST
            console.warn('WebSocket send failed, using REST:', error);
            try {
                await authFetch(`/api/chat/channels/${activeChannel}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: messageToSend })
                });
            } catch (restError) {
                console.error('Failed to send message:', restError);
            }
        }
    };

    // No demo data - use real data only
    const displayChannels = channels;
    const displayMessages = messages;
    const activeChannelData = displayChannels.find(c => c.id === activeChannel);

    return (
        <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
            <div className="admin-page-header" style={{ marginBottom: '1rem' }}>
                <h1 className="admin-page-title">Messages</h1>
                <p className="admin-page-subtitle">Real-time team communication.</p>
            </div>

            <div className="admin-card" style={{
                flex: 1,
                display: 'flex',
                padding: 0,
                overflow: 'hidden'
            }}>
                {/* Channels Sidebar */}
                <ChannelList
                    channels={displayChannels}
                    activeChannel={activeChannel}
                    onSelectChannel={setActiveChannel}
                />

                {/* Chat Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Chat Header */}
                    <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid var(--admin-border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                                # {activeChannelData?.name || 'Select a channel'}
                                {isConnected && <span style={{ marginLeft: '0.5rem', color: '#22c55e', fontSize: '0.7rem' }}>● Live</span>}
                            </h3>
                            {activeChannelData?.description && (
                                <p style={{ fontSize: '0.8rem', color: '#666' }}>{activeChannelData.description}</p>
                            )}
                        </div>
                        {onlineUsers.length > 0 && (
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>
                                {onlineUsers.length} online
                            </span>
                        )}
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                        {displayMessages.map(msg => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isOwn={msg.sender.id === currentUserId}
                            />
                        ))}
                        {typingUsers.length > 0 && (
                            <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>
                                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '1rem',
                        borderTop: '1px solid var(--admin-border-color)',
                        display: 'flex',
                        gap: '0.75rem'
                    }}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
                            disabled={!isConnected && !activeChannel}
                            style={{
                                flex: 1,
                                padding: '0.875rem 1rem',
                                background: 'var(--admin-bg)',
                                border: '1px solid var(--admin-border-color)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            className="admin-btn admin-btn-primary"
                            style={{ padding: '0.875rem 1.5rem' }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
