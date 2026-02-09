import React, { useState, useEffect } from 'react';
import { authFetch } from '../../services/api';

// Types
interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    read: boolean;
    entityId?: string;
    entityType?: string;
    createdAt: string;
}

// Notification icons by type
const typeIcons: Record<string, React.ReactNode> = {
    INFO: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
    SUCCESS: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    WARNING: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    ERROR: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
};

const typeColors: Record<string, string> = {
    INFO: '#3b82f6',
    SUCCESS: '#22c55e',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
};

// Notification Item
const NotificationItem: React.FC<{
    notification: Notification;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ notification, onMarkRead, onDelete }) => (
    <div style={{
        display: 'flex',
        gap: '1rem',
        padding: '1.25rem',
        borderBottom: '1px solid var(--admin-border-color)',
        background: notification.read ? 'transparent' : 'rgba(163, 255, 0, 0.02)',
        transition: 'all 0.2s'
    }}>
        {/* Icon */}
        <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: `${typeColors[notification.type]}20`,
            color: typeColors[notification.type],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }}>
            {typeIcons[notification.type]}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{
                    fontSize: '0.95rem',
                    fontWeight: notification.read ? 500 : 700,
                    color: notification.read ? '#888' : '#fff',
                    marginBottom: '0.25rem'
                }}>
                    {notification.title}
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#555' }}>
                    {formatTimeAgo(notification.createdAt)}
                </span>
            </div>
            <p style={{
                fontSize: '0.85rem',
                color: notification.read ? '#666' : '#aaa',
                lineHeight: 1.5
            }}>
                {notification.message}
            </p>
            {notification.entityType && (
                <span style={{
                    display: 'inline-block',
                    marginTop: '0.5rem',
                    padding: '0.2rem 0.5rem',
                    background: 'var(--admin-hover-bg)',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    color: '#666',
                    textTransform: 'uppercase'
                }}>
                    {notification.entityType}
                </span>
            )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            {!notification.read && (
                <button
                    onClick={() => onMarkRead(notification.id)}
                    title="Mark as read"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#555',
                        cursor: 'pointer',
                        padding: '0.25rem'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </button>
            )}
            <button
                onClick={() => onDelete(notification.id)}
                title="Delete"
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#555',
                    cursor: 'pointer',
                    padding: '0.25rem'
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
            </button>
        </div>
    </div>
);

// Helper function
function formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

// Main Notifications Page
const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await authFetch('/api/notifications');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
        // API call
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        // API call
        try {
            await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        try {
            await authFetch('/api/notifications/read-all', { method: 'PUT' });
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Demo data
    const demoNotifications: Notification[] = [
        { id: '1', title: 'New project assigned', message: 'You have been assigned as the manager for "Nuestras Casas - Phase 2"', type: 'INFO', read: false, entityType: 'PROJECT', entityId: 'proj-1', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', title: 'Payment received', message: 'Invoice INV-2024-0042 ($3,500.00) has been paid by Bijou Me', type: 'SUCCESS', read: false, entityType: 'INVOICE', entityId: 'inv-1', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: '3', title: 'Task overdue', message: 'The task "Homepage wireframes" is 2 days overdue', type: 'WARNING', read: false, entityType: 'TASK', entityId: 'task-1', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: '4', title: 'Deployment failed', message: 'The staging deployment for BSSN USA failed. Check the logs for details.', type: 'ERROR', read: true, entityType: 'PROJECT', entityId: 'proj-2', createdAt: new Date(Date.now() - 172800000).toISOString() },
        { id: '5', title: 'New team member', message: 'María López has joined the team as a Designer', type: 'INFO', read: true, entityType: 'USER', createdAt: new Date(Date.now() - 259200000).toISOString() },
        { id: '6', title: 'Milestone completed', message: 'Milestone "Design Phase" completed for Virako Travel rebrand', type: 'SUCCESS', read: true, entityType: 'PROJECT', createdAt: new Date(Date.now() - 345600000).toISOString() },
    ];

    const displayNotifications = notifications.length > 0 ? notifications : demoNotifications;
    const filteredNotifications = filter === 'UNREAD'
        ? displayNotifications.filter(n => !n.read)
        : displayNotifications;
    const unreadCount = displayNotifications.filter(n => !n.read).length;

    return (
        <div>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="admin-page-title">
                        Notifications
                        {unreadCount > 0 && (
                            <span style={{
                                marginLeft: '0.75rem',
                                padding: '0.25rem 0.75rem',
                                background: 'var(--color-accent)',
                                color: '#000',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: 700
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    <p className="admin-page-subtitle">Stay updated with your activity.</p>
                </div>
                {unreadCount > 0 && (
                    <button className="admin-btn admin-btn-secondary" onClick={markAllAsRead}>
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setFilter('ALL')}
                    className={`admin-btn ${filter === 'ALL' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('UNREAD')}
                    className={`admin-btn ${filter === 'UNREAD' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                    Unread ({unreadCount})
                </button>
            </div>

            {/* Notifications List */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '2rem' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="admin-skeleton" style={{ height: '80px', marginBottom: '0.5rem' }} />
                        ))}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <p>No notifications</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkRead={markAsRead}
                            onDelete={deleteNotification}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
