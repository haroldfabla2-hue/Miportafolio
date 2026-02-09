import React from 'react';

// Placeholder page component for pages under development
interface PlaceholderPageProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description, icon }) => (
    <div>
        <div className="admin-page-header">
            <h1 className="admin-page-title">{title}</h1>
            <p className="admin-page-subtitle">{description || 'This page is under development.'}</p>
        </div>

        <div className="admin-card" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem',
            textAlign: 'center'
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, var(--color-accent), #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                opacity: 0.8
            }}>
                {icon || (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                )}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                Coming Soon
            </h2>
            <p style={{ color: '#666', maxWidth: '400px', lineHeight: 1.6 }}>
                We're working on bringing you an amazing {title.toLowerCase()} experience. Stay tuned!
            </p>
        </div>
    </div>
);

// Export individual pages
export const ProjectsPage = () => (
    <PlaceholderPage
        title="Projects"
        description="Manage all your projects, track progress, and collaborate with your team."
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>}
    />
);

export const ClientsPage = () => (
    <PlaceholderPage
        title="Clients"
        description="View and manage your client relationships, portfolios, and communications."
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
    />
);

export const TasksPage = () => (
    <PlaceholderPage
        title="Tasks"
        description="Organize your work with Kanban boards, due dates, and team assignments."
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>}
    />
);

export const UsersPage = () => (
    <PlaceholderPage
        title="Team Management"
        description="Manage your team members, roles, permissions, and invitations."
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>}
    />
);

export const MessagesPage = () => (
    <PlaceholderPage
        title="Messages"
        description="Real-time chat with your team and clients."
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
    />
);

export const EmailPage = () => (
    <PlaceholderPage
        title="Email"
        description="Integrated email management powered by Gmail."
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
    />
);

export const FilesPage = () => (
    <PlaceholderPage
        title="Files & Drive"
        description="Access and manage files with Google Drive integration."
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>}
    />
);

export const AssetsPage = () => (
    <PlaceholderPage
        title="Assets"
        description="Manage, preview, and organize your digital assets."
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>}
    />
);

export const FinancePage = () => (
    <PlaceholderPage
        title="Finance"
        description="Track invoices, payments, and financial analytics."
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
    />
);

export const PipelinePage = () => (
    <PlaceholderPage
        title="Sales Pipeline"
        description="Track leads, deals, and conversions through your sales funnel."
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>}
    />
);

export const IrisPage = () => (
    <PlaceholderPage
        title="Iris AI"
        description="Your intelligent assistant for CRM insights and automation."
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="21.17" y1="8" x2="12" y2="8" /><line x1="3.95" y1="6.06" x2="8.54" y2="14" /><line x1="10.88" y1="21.94" x2="15.46" y2="14" /></svg>}
    />
);

export const OraclePage = () => (
    <PlaceholderPage
        title="Oracle Engine"
        description="Automate workflows and create intelligent business rules."
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" /><path d="M7.5 13a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" /><path d="M16.5 13a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" /></svg>}
    />
);

export const TicketsPage = () => (
    <PlaceholderPage
        title="Support Tickets"
        description="Manage and resolve support tickets from your team and clients."
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
    />
);

export const SettingsPage = () => (
    <PlaceholderPage
        title="Settings"
        description="Configure your CRM, integrations, and preferences."
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>}
    />
);
