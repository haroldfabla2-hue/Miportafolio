import React, { useState, useEffect, useCallback } from 'react';
import { authFetch } from '../../services/api';
import EmailComposeModal from '../components/EmailComposeModal';
import ThreadView from '../components/ThreadView';
import EmailContextSidebar from '../components/EmailContextSidebar';
import CreateClientModal from '../components/CreateClientModal';
import AssignClientModal from '../components/AssignClientModal';

// Types
interface ClientMatch {
    id: string;
    name: string;
    company: string;
    status: string;
}

interface GmailMessage {
    id: string;
    threadId: string;
    subject: string;
    from: string;
    to: string;
    date: string;
    snippet: string;
    isRead: boolean;
    client?: ClientMatch;
}

interface Email {
    id: string;
    from: { name: string; email: string };
    to: { name?: string; email: string }[];
    subject: string;
    snippet: string;
    body?: string;
    bodyHtml?: string;
    date: string;
    isRead: boolean;
    isStarred: boolean;
    labels: string[];
    threadId?: string;
    attachments?: { filename: string; size: number; url?: string }[];
    client?: ClientMatch;
}

interface EmailDraft {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    isHtml: boolean;
    attachments?: File[];
    replyToMessageId?: string;
}

interface GmailStatus {
    connected: boolean;
    scopes: string[];
    hasGmail: boolean;
    hasDrive: boolean;
}

// Parse "Name <email@example.com>" format
const parseEmailAddress = (raw: string): { name: string; email: string } => {
    const match = raw.match(/^(.+?)\s*<(.+?)>$/);
    if (match) {
        return { name: match[1].trim(), email: match[2].trim() };
    }
    return { name: raw, email: raw };
};

// Gmail Connect Banner
const GmailConnectBanner: React.FC<{ onConnect: () => void }> = ({ onConnect }) => (
    <div style={{
        padding: '3rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '1.5rem'
    }}>
        <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ea4335 0%, #fbbc05 25%, #34a853 50%, #4285f4 75%, #ea4335 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M20 18h-2V9.25L12 13 6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20v12zM4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            </svg>
        </div>
        <div>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                Connect Your Gmail
            </h2>
            <p style={{ color: '#888', fontSize: '0.95rem', maxWidth: '400px' }}>
                Connect your Google account to send and receive emails directly from Iris CRM.
            </p>
        </div>
        <button
            onClick={onConnect}
            style={{
                background: 'var(--color-accent, #a3ff00)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.875rem 2rem',
                color: '#000',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Connect Gmail
        </button>
        <p style={{ color: '#555', fontSize: '0.75rem' }}>
            We'll request permission to read and send emails on your behalf.
        </p>
    </div>
);

// Email Row
const EmailRow: React.FC<{
    email: Email;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ email, isSelected, onSelect }) => (
    <div
        onClick={onSelect}
        style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            gap: '1rem',
            borderBottom: '1px solid var(--admin-border-color)',
            cursor: 'pointer',
            background: isSelected ? 'var(--admin-hover-bg)' : email.isRead ? 'transparent' : 'rgba(163, 255, 0, 0.03)',
            transition: 'all 0.2s'
        }}
    >
        {/* Unread indicator */}
        <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: email.isRead ? 'transparent' : 'var(--color-accent, #a3ff00)',
            flexShrink: 0
        }} />

        {/* From */}
        <div style={{ width: '200px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
                fontWeight: email.isRead ? 400 : 600,
                color: email.isRead ? '#888' : '#fff',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>
                {email.from.name || email.from.email}
            </span>
            {email.client && (
                <span title={`Client: ${email.client.company}`} style={{
                    fontSize: '0.65rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    flexShrink: 0
                }}>
                    CLIENT
                </span>
            )}
        </div>

        {/* Subject + Snippet */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
            <span style={{
                fontWeight: email.isRead ? 400 : 600,
                color: email.isRead ? '#888' : '#fff',
                fontSize: '0.9rem'
            }}>
                {email.subject}
            </span>
            <span style={{ color: '#555', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                - {email.snippet}
            </span>
        </div>

        {/* Date */}
        <span style={{ color: '#666', fontSize: '0.8rem', width: '80px', textAlign: 'right' }}>
            {new Date(email.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </span>
    </div>
);

// Main Email Page
const EmailPage: React.FC = () => {
    const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [emailBody, setEmailBody] = useState<string>('');
    const [showCompose, setShowCompose] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeFolder, setActiveFolder] = useState('INBOX');
    const [replyTo, setReplyTo] = useState<Email | null>(null);

    // Client Management Modal States
    const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
    const [isAssignClientOpen, setIsAssignClientOpen] = useState(false);
    const [clientActionData, setClientActionData] = useState<{ name: string; email: string } | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Check Gmail connection status
    const checkGmailStatus = useCallback(async () => {
        try {
            const response = await authFetch('/api/google/auth/status');
            if (response.ok) {
                const data = await response.json();
                setGmailStatus(data);
                return data.hasGmail;
            }
        } catch (error) {
            console.error('Failed to check Gmail status:', error);
        }
        return false;
    }, []);

    // Fetch emails from Gmail API
    const fetchEmails = useCallback(async () => {
        if (!gmailStatus?.hasGmail) return;

        setLoading(true);
        try {
            const response = await authFetch('/api/google/gmail/messages?limit=50');
            if (response.ok) {
                const data: GmailMessage[] = await response.json();

                // Transform Gmail API response to our Email format
                const transformedEmails: Email[] = data.map(msg => ({
                    id: msg.id,
                    threadId: msg.threadId,
                    from: parseEmailAddress(msg.from),
                    to: [parseEmailAddress(msg.to)],
                    subject: msg.subject || '(No subject)',
                    snippet: msg.snippet,
                    date: msg.date,
                    isRead: msg.isRead,
                    isStarred: false,
                    labels: ['INBOX'],
                    client: msg.client
                }));

                setEmails(transformedEmails);
            }
        } catch (error) {
            console.error('Failed to fetch emails:', error);
        } finally {
            setLoading(false);
        }
    }, [gmailStatus?.hasGmail]);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!gmailStatus?.hasGmail) return;

        try {
            const response = await authFetch('/api/google/gmail/unread-count');
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, [gmailStatus?.hasGmail]);

    // Initial load
    useEffect(() => {
        const init = async () => {
            const hasGmail = await checkGmailStatus();
            if (hasGmail) {
                await fetchEmails();
                await fetchUnreadCount();
            }
            setLoading(false);
        };
        init();
    }, []);

    // Refetch when Gmail becomes connected
    useEffect(() => {
        if (gmailStatus?.hasGmail) {
            fetchEmails();
            fetchUnreadCount();
        }
    }, [gmailStatus?.hasGmail, fetchEmails, fetchUnreadCount]);

    // Handle Google OAuth connect
    const handleConnect = async () => {
        try {
            const response = await authFetch('/api/google/auth/url');
            if (response.ok) {
                const data = await response.json();
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Failed to get auth URL:', error);
        }
    };

    // Handle OAuth callback (check URL params)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code && params.get('google') === 'callback') {
            // Exchange code for tokens
            authFetch('/api/google/auth/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            }).then(() => {
                // Clean URL and refresh status
                window.history.replaceState({}, '', window.location.pathname);
                checkGmailStatus();
            });
        }
    }, [checkGmailStatus]);

    // Send email via Gmail API
    const handleSendEmail = async (draft: EmailDraft) => {
        const response = await authFetch('/api/google/gmail/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: draft.to.join(', '),
                subject: draft.subject,
                body: draft.body,
                cc: draft.cc?.join(', '),
                bcc: draft.bcc?.join(', '),
                isHtml: draft.isHtml
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send email');
        }

        await fetchEmails();
    };

    // Get full email body
    const handleSelectEmail = async (email: Email) => {
        setSelectedEmail(email);
        setEmailBody('');

        // Mark as read
        if (!email.isRead) {
            fetch(`/api/google/gmail/messages/${email.id}/read`, { method: 'POST' });
            setEmails(prev => prev.map(e =>
                e.id === email.id ? { ...e, isRead: true } : e
            ));
        }

        // Fetch full body
        try {
            const response = await fetch(`/api/google/gmail/messages/${email.id}`);
            if (response.ok) {
                const data = await response.json();
                // Extract body from Gmail API response
                const body = extractBody(data);
                setEmailBody(body);
            }
        } catch (error) {
            console.error('Failed to fetch email body:', error);
        }
    };

    // Extract body from Gmail API message format
    const extractBody = (message: any): string => {
        const payload = message.payload;
        if (!payload) return message.snippet || '';

        // Check for direct body
        if (payload.body?.data) {
            return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }

        // Check parts
        if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/plain' && part.body?.data) {
                    return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                }
                if (part.mimeType === 'text/html' && part.body?.data) {
                    return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                }
            }
        }

        return message.snippet || '';
    };

    const handleReply = (email: Email) => {
        setReplyTo(email);
        setShowCompose(true);
    };

    const handleArchive = async () => {
        if (!selectedEmail) return;
        // TODO: Implement archive via Gmail API
        setSelectedEmail(null);
    };

    const handleDelete = async () => {
        if (!selectedEmail) return;
        try {
            await fetch(`/api/google/gmail/messages/${selectedEmail.id}`, { method: 'DELETE' });
            setEmails(prev => prev.filter(e => e.id !== selectedEmail.id));
            setSelectedEmail(null);
        } catch (error) {
            console.error('Failed to delete email:', error);
        }
    };

    const handleQuickReply = async (body: string) => {
        if (!selectedEmail) return;
        await handleSendEmail({
            to: [selectedEmail.from.email],
            subject: `Re: ${selectedEmail.subject.replace(/^Re:\s*/i, '')}`,
            body,
            isHtml: false
        });
        await fetchEmails();
    };

    // Client Management Handlers
    const handleCreateClient = () => {
        if (!selectedEmail) return;
        setClientActionData({
            name: selectedEmail.from.name,
            email: selectedEmail.from.email
        });
        setIsCreateClientOpen(true);
    };

    const handleAssignClient = () => {
        if (!selectedEmail) return;
        setIsAssignClientOpen(true);
    };

    const handleClientCreated = async (newClient: any) => {
        console.log('Client created:', newClient);
        await fetchEmails(); // Refresh to update badges (if matching logic detects newly created client)
        setIsCreateClientOpen(false);
    };

    const handleClientAssigned = async (clientId: string) => {
        console.log('Assigning email', selectedEmail?.from.email, 'to client', clientId);
        // TODO: Call backend to link email to client (e.g., update client email or add alias)
        // For now just log and close
        setIsAssignClientOpen(false);
    };

    const folders = [
        { id: 'INBOX', label: 'Inbox', count: unreadCount },
        { id: 'STARRED', label: 'Starred', count: 0 },
        { id: 'SENT', label: 'Sent', count: 0 },
        { id: 'DRAFTS', label: 'Drafts', count: 0 },
        { id: 'TRASH', label: 'Trash', count: 0 },
    ];

    // Show connect banner if Gmail not connected
    if (gmailStatus && !gmailStatus.hasGmail) {
        return (
            <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
                <div className="admin-page-header" style={{ marginBottom: '1rem' }}>
                    <h1 className="admin-page-title">Email</h1>
                    <p className="admin-page-subtitle">Connect Gmail to get started.</p>
                </div>
                <div className="admin-card" style={{ flex: 1 }}>
                    <GmailConnectBanner onConnect={handleConnect} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <h1 className="admin-page-title">Email</h1>
                    <p className="admin-page-subtitle">
                        {gmailStatus?.connected ? 'Connected to Gmail' : 'Loading...'}
                    </p>
                </div>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => { setReplyTo(null); setShowCompose(true); }}
                    disabled={!gmailStatus?.hasGmail}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Compose
                </button>
            </div>

            <div className="admin-card" style={{ flex: 1, display: 'flex', padding: 0, overflow: 'hidden' }}>
                {/* Folders Sidebar */}
                <div style={{ width: '200px', borderRight: '1px solid var(--admin-border-color)', padding: '1rem', flexShrink: 0 }}>
                    {folders.map(folder => (
                        <div
                            key={folder.id}
                            onClick={() => { setActiveFolder(folder.id); setSelectedEmail(null); }}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                marginBottom: '0.25rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                background: activeFolder === folder.id ? 'var(--color-accent)' : 'transparent',
                                color: activeFolder === folder.id ? '#000' : '#888',
                                fontWeight: activeFolder === folder.id ? 600 : 400,
                                fontSize: '0.9rem'
                            }}
                        >
                            <span>{folder.label}</span>
                            {folder.count > 0 && (
                                <span style={{
                                    fontWeight: 600,
                                    color: activeFolder === folder.id ? '#000' : 'var(--color-accent)'
                                }}>
                                    {folder.count}
                                </span>
                            )}
                        </div>
                    ))}

                    {/* Refresh button */}
                    <button
                        onClick={fetchEmails}
                        style={{
                            marginTop: '1rem',
                            width: '100%',
                            padding: '0.75rem',
                            background: 'var(--admin-hover-bg)',
                            border: '1px solid var(--admin-border-color)',
                            borderRadius: '10px',
                            color: '#888',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '0.85rem'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 4v6h-6" />
                            <path d="M1 20v-6h6" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Email List or Thread View */}
                {selectedEmail ? (
                    <>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <ThreadView
                                messages={[{
                                    id: selectedEmail.id,
                                    from: selectedEmail.from,
                                    to: selectedEmail.to,
                                    subject: selectedEmail.subject,
                                    body: emailBody || selectedEmail.snippet,
                                    date: selectedEmail.date,
                                    isRead: selectedEmail.isRead,
                                    attachments: selectedEmail.attachments
                                }]}
                                onReply={() => handleReply(selectedEmail)}
                                onReplyAll={() => handleReply(selectedEmail)}
                                onForward={() => { }}
                                onArchive={handleArchive}
                                onDelete={handleDelete}
                                onBack={() => setSelectedEmail(null)}
                                onQuickReply={handleQuickReply}
                            />
                        </div>
                        <EmailContextSidebar
                            client={selectedEmail.client}
                            senderEmail={selectedEmail.from.email}
                            senderName={selectedEmail.from.name}
                            onAssignClient={handleAssignClient}
                            onCreateClient={handleCreateClient}
                        />
                    </>
                ) : (
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '2rem' }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="admin-skeleton" style={{ height: '60px', marginBottom: '0.5rem' }} />
                                ))}
                            </div>
                        ) : emails.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '1rem', opacity: 0.5 }}>
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <p>No emails found</p>
                            </div>
                        ) : (
                            emails.map(email => (
                                <EmailRow
                                    key={email.id}
                                    email={email}
                                    isSelected={false}
                                    onSelect={() => handleSelectEmail(email)}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Compose Modal */}
            <EmailComposeModal
                isOpen={showCompose}
                onClose={() => { setShowCompose(false); setReplyTo(null); }}
                onSend={handleSendEmail}
                replyTo={replyTo ? {
                    messageId: replyTo.id,
                    from: replyTo.from,
                    subject: replyTo.subject,
                    body: emailBody || replyTo.snippet,
                    date: new Date(replyTo.date).toLocaleString()
                } : undefined}
            />
            <CreateClientModal
                isOpen={isCreateClientOpen}
                onClose={() => setIsCreateClientOpen(false)}
                onSuccess={handleClientCreated}
                initialData={clientActionData || undefined}
            />

            <AssignClientModal
                isOpen={isAssignClientOpen}
                onClose={() => setIsAssignClientOpen(false)}
                onSuccess={handleClientAssigned}
                emailId={selectedEmail?.id || ''}
            />
        </div>
    );
};

export default EmailPage;
