import React, { useState, useEffect } from 'react';
import { authFetch } from '../../services/api';

// Settings sections
type SettingsSection = 'profile' | 'google' | 'integrations' | 'api' | 'notifications' | 'appearance';

// Google connection status
interface GoogleStatus {
    connected: boolean;
    scopes: string[];
    hasGmail: boolean;
    hasDrive: boolean;
    hasCalendar: boolean;
    hasTasks: boolean;
    hasContacts: boolean;
    assignedFolder: { id: string; name: string } | null;
}

// Integration card
interface Integration {
    id: string;
    name: string;
    description: string;
    icon: string;
    connected: boolean;
    accountEmail?: string;
}

const SettingsPage: React.FC = () => {
    const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
    const [profile, setProfile] = useState({
        name: 'Alberto Farah',
        email: 'alberto@example.com',
        timezone: 'America/Lima',
        language: 'es'
    });
    const [googleStatus, setGoogleStatus] = useState<GoogleStatus>({
        connected: false,
        scopes: [],
        hasGmail: false,
        hasDrive: false,
        hasCalendar: false,
        hasTasks: false,
        hasContacts: false,
        assignedFolder: null,
    });
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [integrations] = useState<Integration[]>([
        { id: 'slack', name: 'Slack', description: 'Receive notifications in Slack', icon: '💬', connected: false },
        { id: 'stripe', name: 'Stripe', description: 'Process payments and invoices', icon: '💳', connected: true, accountEmail: 'acct_xxx' },
        { id: 'github', name: 'GitHub', description: 'Connect repositories and issues', icon: '🐙', connected: false },
    ]);
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        projectUpdates: true,
        taskAssignments: true,
        invoiceAlerts: true,
        weeklyDigest: false
    });
    const [appearance, setAppearance] = useState({
        theme: 'dark',
        accentColor: '#A3FF00',
        compactMode: false
    });

    const sections = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'google', label: 'Google', icon: '🔵' },
        { id: 'integrations', label: 'Other Integrations', icon: '🔌' },
        { id: 'api', label: 'API Keys', icon: '🔑' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'appearance', label: 'Appearance', icon: '🎨' },
    ];

    // Check for Google OAuth callback
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const googleCallback = params.get('google');
        const code = params.get('code');

        if (googleCallback === 'callback' && code) {
            handleGoogleCallback(code);
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        } else {
            fetchGoogleStatus();
        }
    }, []);

    const fetchGoogleStatus = async () => {
        try {
            const response = await authFetch('/api/google/auth/status');
            if (response.ok) {
                const data = await response.json();
                setGoogleStatus(data);
            }
        } catch (error) {
            console.error('Failed to fetch Google status:', error);
        }
    };

    const handleConnectGoogle = async () => {
        setLoadingGoogle(true);
        try {
            const response = await authFetch('/api/google/auth/url');
            if (response.ok) {
                const { url } = await response.json();
                window.location.href = url;
            }
        } catch (error) {
            console.error('Failed to get Google auth URL:', error);
            setLoadingGoogle(false);
        }
    };

    const handleGoogleCallback = async (code: string) => {
        setLoadingGoogle(true);
        try {
            const response = await authFetch('/api/google/auth/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });
            if (response.ok) {
                await fetchGoogleStatus();
                setActiveSection('google');
            }
        } catch (error) {
            console.error('Failed to complete Google auth:', error);
        } finally {
            setLoadingGoogle(false);
        }
    };

    const handleDisconnectGoogle = async () => {
        if (!confirm('Are you sure you want to disconnect your Google account? This will revoke access to Gmail and Drive.')) return;

        try {
            const response = await authFetch('/api/google/auth/disconnect', { method: 'POST' });
            if (response.ok) {
                setGoogleStatus({
                    connected: false,
                    scopes: [],
                    hasGmail: false,
                    hasDrive: false,
                    hasCalendar: false,
                    hasTasks: false,
                    hasContacts: false,
                    assignedFolder: null,
                });
            }
        } catch (error) {
            console.error('Failed to disconnect Google:', error);
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.875rem 1rem', background: 'var(--admin-bg)',
        border: '1px solid var(--admin-border-color)', borderRadius: '10px', color: '#fff', fontSize: '0.95rem'
    };

    return (
        <div>
            <div className="admin-page-header">
                <h1 className="admin-page-title">Settings</h1>
                <p className="admin-page-subtitle">Manage your account, integrations, and preferences.</p>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
                {/* Sidebar */}
                <div style={{ width: '200px', flexShrink: 0 }}>
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id as SettingsSection)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
                                padding: '0.875rem 1rem', borderRadius: '10px', border: 'none',
                                background: activeSection === section.id ? 'var(--color-accent)' : 'transparent',
                                color: activeSection === section.id ? '#000' : '#888',
                                fontWeight: activeSection === section.id ? 600 : 400,
                                fontSize: '0.9rem', cursor: 'pointer', marginBottom: '0.25rem', textAlign: 'left'
                            }}
                        >
                            <span>{section.icon}</span>
                            <span>{section.label}</span>
                            {section.id === 'google' && googleStatus.connected && (
                                <span style={{
                                    marginLeft: 'auto', width: '8px', height: '8px',
                                    borderRadius: '50%', background: '#22c55e'
                                }} />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                    {activeSection === 'profile' && (
                        <div className="admin-card">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>Profile Settings</h3>
                            <div style={{ display: 'grid', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>Full Name</label>
                                    <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>Email</label>
                                    <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} style={inputStyle} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>Timezone</label>
                                        <select value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })} style={inputStyle}>
                                            <option value="America/Lima">America/Lima (GMT-5)</option>
                                            <option value="America/New_York">America/New_York (GMT-5)</option>
                                            <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
                                            <option value="Europe/London">Europe/London (GMT+0)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>Language</label>
                                        <select value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })} style={inputStyle}>
                                            <option value="es">Español</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                </div>
                                <button className="admin-btn admin-btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'google' && (
                        <div>
                            {/* Connection Status Card */}
                            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '16px',
                                            background: googleStatus.connected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
                                        }}>
                                            {googleStatus.connected ? '✅' : '🔵'}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                                                Google Account
                                            </h3>
                                            <p style={{ fontSize: '0.9rem', color: googleStatus.connected ? '#22c55e' : '#888', margin: 0 }}>
                                                {googleStatus.connected ? 'Connected' : 'Not connected'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={googleStatus.connected ? handleDisconnectGoogle : handleConnectGoogle}
                                        className={`admin-btn ${googleStatus.connected ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
                                        disabled={loadingGoogle}
                                        style={{ minWidth: '140px' }}
                                    >
                                        {loadingGoogle ? 'Loading...' : googleStatus.connected ? 'Disconnect' : 'Connect Google'}
                                    </button>
                                </div>
                            </div>

                            {/* Services Status */}
                            {googleStatus.connected && (
                                <div className="admin-grid admin-grid-2" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                                    <div className="admin-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '1.5rem' }}>📧</span>
                                            <div>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>Gmail</h4>
                                                <p style={{ fontSize: '0.8rem', color: googleStatus.hasGmail ? '#22c55e' : '#888', margin: 0 }}>
                                                    {googleStatus.hasGmail ? 'Authorized' : 'Not authorized'}
                                                </p>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                                            Synced with your inbox.
                                        </p>
                                    </div>

                                    <div className="admin-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '1.5rem' }}>📁</span>
                                            <div>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>Google Drive</h4>
                                                <p style={{ fontSize: '0.8rem', color: googleStatus.hasDrive ? '#22c55e' : '#888', margin: 0 }}>
                                                    {googleStatus.hasDrive ? 'Authorized' : 'Not authorized'}
                                                </p>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                                            File storage access.
                                        </p>
                                    </div>

                                    <div className="admin-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '1.5rem' }}>📅</span>
                                            <div>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>Calendar</h4>
                                                <p style={{ fontSize: '0.8rem', color: googleStatus.hasCalendar ? '#22c55e' : '#888', margin: 0 }}>
                                                    {googleStatus.hasCalendar ? 'Authorized' : 'Not authorized'}
                                                </p>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                                            Sync meetings and events.
                                        </p>
                                    </div>

                                    <div className="admin-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '1.5rem' }}>✅</span>
                                            <div>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>Tasks</h4>
                                                <p style={{ fontSize: '0.8rem', color: googleStatus.hasTasks ? '#22c55e' : '#888', margin: 0 }}>
                                                    {googleStatus.hasTasks ? 'Authorized' : 'Not authorized'}
                                                </p>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                                            Sync CRM tasks.
                                        </p>
                                    </div>

                                    <div className="admin-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '1.5rem' }}>👥</span>
                                            <div>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>Contacts</h4>
                                                <p style={{ fontSize: '0.8rem', color: googleStatus.hasContacts ? '#22c55e' : '#888', margin: 0 }}>
                                                    {googleStatus.hasContacts ? 'Authorized' : 'Not authorized'}
                                                </p>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                                            Sync CRM clients.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Assigned Folder */}
                            {googleStatus.connected && (
                                <div className="admin-card">
                                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
                                        Assigned Drive Folder
                                    </h4>
                                    {googleStatus.assignedFolder ? (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                                            background: 'var(--admin-bg)', borderRadius: '10px'
                                        }}>
                                            <span style={{ fontSize: '2rem' }}>📂</span>
                                            <div>
                                                <p style={{ fontSize: '1rem', fontWeight: 500, color: '#fff', margin: 0 }}>
                                                    {googleStatus.assignedFolder.name}
                                                </p>
                                                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0, fontFamily: 'monospace' }}>
                                                    ID: {googleStatus.assignedFolder.id}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '1.5rem', background: 'var(--admin-bg)', borderRadius: '10px',
                                            textAlign: 'center', border: '1px dashed var(--admin-border-color)'
                                        }}>
                                            <p style={{ color: '#666', margin: 0 }}>
                                                No folder assigned. Ask your admin to assign a Drive folder to your account.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Not Connected Info */}
                            {!googleStatus.connected && (
                                <div className="admin-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔐</div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
                                        Connect your Google Account
                                    </h3>
                                    <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                                        Connect your Google account to access Gmail and Drive features. You'll be able to send emails from your Gmail and access files in your assigned folder.
                                    </p>
                                    <button
                                        onClick={handleConnectGoogle}
                                        className="admin-btn admin-btn-primary"
                                        disabled={loadingGoogle}
                                        style={{ padding: '1rem 2rem', fontSize: '1rem' }}
                                    >
                                        {loadingGoogle ? 'Redirecting...' : '🔵 Connect with Google'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'integrations' && (
                        <div className="admin-grid admin-grid-2">
                            {integrations.map(integration => (
                                <div key={integration.id} className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <span style={{ fontSize: '2rem' }}>{integration.icon}</span>
                                        <div>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>{integration.name}</h4>
                                            <p style={{ fontSize: '0.8rem', color: '#666' }}>{integration.description}</p>
                                            {integration.connected && integration.accountEmail && (
                                                <p style={{ fontSize: '0.75rem', color: 'var(--color-accent)', marginTop: '0.25rem' }}>{integration.accountEmail}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button className={`admin-btn ${integration.connected ? 'admin-btn-secondary' : 'admin-btn-primary'}`}>
                                        {integration.connected ? 'Disconnect' : 'Connect'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeSection === 'api' && (
                        <div className="admin-card">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>API Keys</h3>
                            <div style={{ background: 'var(--admin-bg)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Production API Key</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="password" value="sk_live_xxxxxxxxxxxxxxxxxxxxx" readOnly style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--admin-border-color)', borderRadius: '8px', color: '#fff', fontFamily: 'monospace' }} />
                                    <button className="admin-btn admin-btn-secondary">Copy</button>
                                </div>
                            </div>
                            <div style={{ background: 'var(--admin-bg)', padding: '1rem', borderRadius: '10px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Test API Key</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="password" value="sk_test_xxxxxxxxxxxxxxxxxxxxx" readOnly style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--admin-border-color)', borderRadius: '8px', color: '#fff', fontFamily: 'monospace' }} />
                                    <button className="admin-btn admin-btn-secondary">Copy</button>
                                </div>
                            </div>
                            <button className="admin-btn admin-btn-primary" style={{ marginTop: '1.5rem' }}>Regenerate Keys</button>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div className="admin-card">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>Notification Preferences</h3>
                            {Object.entries(notificationSettings).map(([key, value]) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--admin-border-color)' }}>
                                    <span style={{ color: '#fff', fontSize: '0.9rem' }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                    <button
                                        onClick={() => setNotificationSettings({ ...notificationSettings, [key]: !value })}
                                        style={{
                                            width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', position: 'relative',
                                            background: value ? 'var(--color-accent)' : 'var(--admin-border-color)', transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{
                                            position: 'absolute', top: '3px', left: value ? '25px' : '3px',
                                            width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'all 0.2s'
                                        }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeSection === 'appearance' && (
                        <div className="admin-card">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>Appearance</h3>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.75rem' }}>Theme</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {['dark', 'light', 'system'].map(theme => (
                                        <button
                                            key={theme}
                                            onClick={() => setAppearance({ ...appearance, theme })}
                                            className={`admin-btn ${appearance.theme === theme ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                                        >
                                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.75rem' }}>Accent Color</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['#A3FF00', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setAppearance({ ...appearance, accentColor: color })}
                                            style={{
                                                width: '36px', height: '36px', borderRadius: '50%', border: appearance.accentColor === color ? '3px solid #fff' : '3px solid transparent',
                                                background: color, cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
