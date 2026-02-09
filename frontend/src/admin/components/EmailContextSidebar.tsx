import React from 'react';

interface ClientMatch {
    id: string;
    name: string;
    company: string;
    status: string;
}

interface EmailContextSidebarProps {
    client?: ClientMatch;
    senderEmail: string;
    senderName: string;
    onAssignClient: () => void;
    onCreateClient: () => void;
}

const EmailContextSidebar: React.FC<EmailContextSidebarProps> = ({
    client,
    senderEmail,
    senderName,
    onAssignClient,
    onCreateClient
}) => {
    return (
        <div style={{
            width: '300px',
            borderLeft: '1px solid var(--admin-border-color)',
            background: 'var(--admin-card-bg)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
        }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--admin-border-color)' }}>
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#888', letterSpacing: '1px', marginBottom: '1rem' }}>
                    Context
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: client ? 'var(--color-accent)' : '#333',
                        color: client ? '#000' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', fontWeight: 600
                    }}>
                        {(client?.name || senderName).charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>{client?.name || senderName}</h4>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.8rem' }}>{senderEmail}</p>
                    </div>
                </div>

                {client ? (
                    <div>
                        <div style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            background: 'rgba(34, 197, 94, 0.15)',
                            color: '#22c55e',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            marginBottom: '1rem'
                        }}>
                            {client.company} • {client.status}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                                View Profile
                            </button>
                            <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                                + Deal
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '1rem', background: 'var(--admin-bg)', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            {senderEmail} is not in your CRM.
                        </p>
                        <button
                            onClick={onCreateClient}
                            className="admin-btn admin-btn-primary"
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                        >
                            Add as Client
                        </button>
                        <button
                            onClick={onAssignClient}
                            style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Assign to existing
                        </button>
                    </div>
                )}
            </div>

            {/* AI Insights Placeholder */}
            <div style={{ padding: '1.5rem', flex: 1 }}>
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#888', letterSpacing: '1px', marginBottom: '1rem' }}>
                    AI Insights
                </h3>
                <div style={{
                    padding: '1rem',
                    border: '1px dashed var(--admin-border-color)',
                    borderRadius: '8px',
                    color: '#666',
                    fontSize: '0.85rem',
                    textAlign: 'center'
                }}>
                    Select an email to generate insights
                </div>
            </div>
        </div>
    );
};

export default EmailContextSidebar;
