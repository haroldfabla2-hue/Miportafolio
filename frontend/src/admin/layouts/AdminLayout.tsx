import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';
import '../styles/admin.css';
import IrisFloat from '../components/IrisFloat';
import { TourProvider } from '../../context/TourContext';
import NotificationToast from '../components/NotificationToast';

// Icons (inline SVG components for no external deps)
const icons = {
    dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    projects: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
    clients: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    tasks: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
    users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>,
    messages: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    email: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    files: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>,
    assets: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>,
    finance: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    pipeline: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    iris: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="21.17" y1="8" x2="12" y2="8" /><line x1="3.95" y1="6.06" x2="8.54" y2="14" /><line x1="10.88" y1="21.94" x2="15.46" y2="14" /></svg>,
    oracle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" /><path d="M7.5 13a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" /><path d="M16.5 13a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" /></svg>,
    settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    tickets: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
    close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    chevronDown: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>,
    reports: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
};

// Navigation items configuration with required permissions
const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/admin', permission: 'dashboard:view' },
    { id: 'projects', label: 'Projects', icon: 'projects', path: '/admin/projects', permission: 'projects:view' },
    { id: 'clients', label: 'Clients', icon: 'clients', path: '/admin/clients', permission: 'clients:view' },
    { id: 'tasks', label: 'Tasks', icon: 'tasks', path: '/admin/tasks', permission: 'tasks:view' },
    { id: 'users', label: 'Team', icon: 'users', path: '/admin/users', permission: 'team:view' },
    { type: 'divider' },
    { type: 'section', label: 'Communication' },
    { id: 'messages', label: 'Messages', icon: 'messages', path: '/admin/messages', permission: 'messages:access' },
    { id: 'email', label: 'Email', icon: 'email', path: '/admin/email', permission: 'email:access' },
    { type: 'divider' },
    { type: 'section', label: 'Resources' },
    { id: 'files', label: 'Files & Drive', icon: 'files', path: '/admin/files', permission: 'files:access' },
    { id: 'assets', label: 'Assets', icon: 'assets', path: '/admin/assets', permission: 'assets:access' },
    { id: 'cms', label: 'Content Manager', icon: 'files', path: '/admin/cms', permission: 'cms:view' },
    { type: 'divider' },
    { type: 'section', label: 'Business' },
    { id: 'finance', label: 'Finance', icon: 'finance', path: '/admin/finance', permission: 'finance:view' },
    { id: 'pipeline', label: 'Pipeline', icon: 'pipeline', path: '/admin/pipeline', permission: 'pipeline:view' },
    { type: 'divider' },
    { type: 'section', label: 'Intelligence' },
    { id: 'iris', label: 'Iris AI', icon: 'iris', path: '/admin/iris', permission: 'iris:access' },
    { id: 'oracle', label: 'Oracle', icon: 'oracle', path: '/admin/oracle', permission: 'oracle:access' },
    { id: 'reports', label: 'Reports', icon: 'reports', path: '/admin/reports', permission: 'dashboard:view' }, // Reusing dashboard permission for now
    { type: 'divider' },
    { id: 'tickets', label: 'Tickets', icon: 'tickets', path: '/admin/tickets', permission: 'tickets:view' },
    { id: 'settings', label: 'Settings', icon: 'settings', path: '/admin/settings', permission: 'settings:view' },
];

const AdminLayout: React.FC = () => {
    const { user, isAuthenticated, isLoading, logout, hasPermission } = useAuth();
    const { socket } = useSocket();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showIrisFloat, setShowIrisFloat] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Notification Logic
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeNotification, setActiveNotification] = useState<any>(null); // State for toast

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (socket) {
            socket.on('notification', (notification: any) => {
                setNotifications(prev => [notification, ...prev]);
                setActiveNotification(notification); // Show toast

                // Optional: Play a sound
                try {
                    const audio = new Audio('/assets/sounds/notification.mp3');
                    audio.volume = 0.5;
                    audio.play().catch(e => console.log('Audio play failed', e));
                } catch (e) {
                    // Ignore audio errors
                }
            });

            return () => {
                socket.off('notification');
            };
        }
    }, [socket]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications/unread');
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        if (e && e.stopPropagation) e.stopPropagation();
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const handleNotificationClick = (notification: any) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        setShowNotifications(false);

        // Routing logic
        if (notification.entityType === 'PROJECT' && notification.entityId) {
            navigate(`/admin/projects/${notification.entityId}`);
        } else if (notification.entityType === 'TASK') {
            navigate('/admin/tasks');
        } else if (notification.entityType === 'CLIENT') {
            navigate('/admin/clients');
        } else if (notification.entityType === 'INVOICE') {
            navigate('/admin/finance');
        }
    };

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg)', color: '#fff' }}>Loading...</div>;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/admin/login" replace />;
    }

    // Enforce Onboarding
    // If user hasn't completed onboarding and is not already on the onboarding page, redirect them.
    if (!user.onboardingCompleted && location.pathname !== '/admin/onboarding') {
        return <Navigate to="/admin/onboarding" replace />;
    }

    // If user HAS completed onboarding but tries to access it again, redirect to dashboard.
    if (user.onboardingCompleted && location.pathname === '/admin/onboarding') {
        return <Navigate to="/admin" replace />;
    }

    const isActive = (path: string) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <TourProvider>
            <div className="admin-container">
                {/* Sidebar */}
                <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                    <div className="admin-sidebar-header">
                        <div className="admin-sidebar-logo">I</div>
                        <span className="admin-sidebar-title">Iris CRM</span>
                    </div>

                    <nav className="admin-nav">
                        {navItems.map((item, index) => {
                            if (item.type === 'divider') {
                                return <div key={`divider-${index}`} className="admin-nav-divider" />;
                            }
                            if (item.type === 'section') {
                                return (
                                    <div key={`section-${index}`} className="admin-nav-section">
                                        {item.label}
                                    </div>
                                );
                            }

                            // Check permission for this menu item
                            if (item.permission && !hasPermission(item.permission)) {
                                return null;
                            }

                            return (
                                <Link
                                    key={item.id}
                                    to={item.path!}
                                    className={`admin-nav-item ${isActive(item.path!) ? 'active' : ''}`}
                                >
                                    {icons[item.icon as keyof typeof icons]}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="admin-main">
                    {/* Header */}
                    <header className="admin-header">
                        <div className="admin-header-left">
                            <button
                                className="admin-toggle-btn"
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            >
                                {sidebarCollapsed ? icons.menu : icons.close}
                            </button>

                            <div className="admin-search">
                                {icons.search}
                                <input type="text" placeholder="Search projects, clients, tasks..." />
                            </div>
                        </div>

                        <div className="admin-header-right">
                            <div style={{ position: 'relative' }}>
                                <button
                                    className="admin-notification-btn"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                >
                                    {icons.bell}
                                    {notifications.length > 0 && <span className="admin-notification-badge">{notifications.length}</span>}
                                </button>

                                {showNotifications && (
                                    <div style={{
                                        position: 'absolute', top: '100%', right: 0, marginTop: '10px',
                                        width: '320px', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border-color)',
                                        borderRadius: '12px', padding: '1rem', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                        maxHeight: '400px', overflowY: 'auto'
                                    }}>
                                        <h4 style={{ color: '#fff', marginBottom: '0.75rem', fontSize: '0.9rem', borderBottom: '1px solid var(--admin-border-color)', paddingBottom: '0.5rem' }}>Notifications</h4>
                                        {notifications.length === 0 ? (
                                            <p style={{ color: '#666', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>No new notifications</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => handleNotificationClick(n)}
                                                        style={{
                                                            padding: '0.75rem', background: 'var(--admin-bg)', borderRadius: '8px',
                                                            fontSize: '0.85rem', color: '#ddd', display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#fff' }}>{n.title}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: 1.4 }}>{n.message}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>{new Date(n.createdAt).toLocaleString()}</div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => markAsRead(n.id, e)}
                                                            style={{
                                                                background: 'none', border: 'none',
                                                                color: 'var(--color-accent)', cursor: 'pointer', padding: '4px'
                                                            }}
                                                            title="Mark as read"
                                                        >
                                                            ✓
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div
                                className="admin-user-menu"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                style={{ position: 'relative' }}
                            >
                                <div className="admin-user-info">
                                    <div className="admin-user-name">{user.name}</div>
                                    <div className="admin-user-role">{user.role}</div>
                                </div>
                                <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.name} className="admin-user-avatar" />
                                {icons.chevronDown}

                                {showUserMenu && (
                                    <div className="admin-dropdown">
                                        <button className="admin-dropdown-item">
                                            {icons.settings}
                                            <span>Account Settings</span>
                                        </button>
                                        <div className="admin-dropdown-divider" />
                                        <button className="admin-dropdown-item danger" onClick={logout}>
                                            {icons.logout}
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="admin-content">
                        <Outlet />
                    </div>
                </main>

                {/* Iris AI Float Widget */}
                <IrisFloat isOpen={showIrisFloat} onToggle={() => setShowIrisFloat(!showIrisFloat)} />

                {/* Real-time Notification Toast */}
                <NotificationToast
                    notification={activeNotification}
                    onClose={() => setActiveNotification(null)}
                />
            </div>
        </TourProvider>
    );
};

export default AdminLayout;
