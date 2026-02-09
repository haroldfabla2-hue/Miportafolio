import React, { useEffect, useState } from 'react';

interface NotificationToastProps {
    notification: {
        id: string;
        title: string;
        message: string;
        type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    } | null;
    onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 300); // Wait for exit animation
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification && !visible) return null;

    const getTypeColor = (type?: string) => {
        switch (type) {
            case 'SUCCESS': return 'var(--status-success)';
            case 'WARNING': return 'var(--status-warning)';
            case 'ERROR': return 'var(--status-error)';
            default: return 'var(--color-accent)';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'var(--admin-card-bg)',
            border: '1px solid var(--admin-border-color)',
            borderLeft: `4px solid ${getTypeColor(notification?.type)}`,
            borderRadius: '8px',
            padding: '1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'start',
            gap: '1rem',
            maxWidth: '350px',
            transform: visible ? 'translateX(0)' : 'translateX(120%)',
            opacity: visible ? 1 : 0,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '0.95rem' }}>{notification?.title}</h4>
                <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem', lineHeight: 1.4 }}>{notification?.message}</p>
            </div>
            <button
                onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    padding: '0',
                    fontSize: '1.2rem',
                    lineHeight: 1
                }}
            >
                ×
            </button>
        </div>
    );
};

export default NotificationToast;
