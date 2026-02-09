import React, { useState, useRef, useCallback } from 'react';

interface EmailComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (email: EmailDraft) => Promise<void>;
    replyTo?: EmailReplyData;
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

interface EmailReplyData {
    messageId: string;
    from: { name: string; email: string };
    subject: string;
    body: string;
    date: string;
}

interface Attachment {
    file: File;
    id: string;
    progress: number;
}

const EmailComposeModal: React.FC<EmailComposeModalProps> = ({
    isOpen,
    onClose,
    onSend,
    replyTo
}) => {
    const [to, setTo] = useState(replyTo?.from.email || '');
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [subject, setSubject] = useState(
        replyTo ? `Re: ${replyTo.subject.replace(/^Re:\s*/i, '')}` : ''
    );
    const [body, setBody] = useState(
        replyTo ? `\n\n---\nOn ${replyTo.date}, ${replyTo.from.name} wrote:\n> ${replyTo.body.replace(/\n/g, '\n> ')}` : ''
    );
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [showCcBcc, setShowCcBcc] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!to.trim() || !subject.trim()) {
            setError('To and Subject are required');
            return;
        }

        setSending(true);
        setError('');

        try {
            await onSend({
                to: to.split(',').map(e => e.trim()).filter(Boolean),
                cc: cc ? cc.split(',').map(e => e.trim()).filter(Boolean) : undefined,
                bcc: bcc ? bcc.split(',').map(e => e.trim()).filter(Boolean) : undefined,
                subject,
                body,
                isHtml: false,
                attachments: attachments.map(a => a.file),
                replyToMessageId: replyTo?.messageId
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        const newAttachments: Attachment[] = Array.from(files).map(file => ({
            file,
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            progress: 100
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(a => a.id !== id));
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        handleFileSelect(e.dataTransfer.files);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const generateAiDraft = async () => {
        if (!subject.trim()) {
            setError('Please enter a subject first for AI to generate content');
            return;
        }

        setAiLoading(true);
        setError('');

        try {
            const response = await fetch('/api/iris/generate-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: to || 'client',
                    purpose: subject,
                    context: replyTo ? `Replying to: ${replyTo.body.slice(0, 200)}` : undefined
                })
            });

            if (response.ok) {
                const data = await response.json();
                setBody(data.content || data.response || '');
            } else {
                throw new Error('AI service unavailable');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate AI draft');
        } finally {
            setAiLoading(false);
        }
    };

    const applyTemplate = (template: 'invoice' | 'update' | 'followup') => {
        const templates: Record<string, { subject: string; body: string }> = {
            invoice: {
                subject: 'Invoice Reminder - Payment Due',
                body: `Dear Client,\n\nThis is a friendly reminder that invoice #[INVOICE_NUMBER] for $[AMOUNT] is due on [DUE_DATE].\n\nPlease let me know if you have any questions or need any clarification regarding this invoice.\n\nBest regards`
            },
            update: {
                subject: 'Project Update - [PROJECT_NAME]',
                body: `Hi [CLIENT_NAME],\n\nI wanted to give you a quick update on the progress of [PROJECT_NAME]:\n\n✅ Completed:\n- [COMPLETED_ITEM_1]\n- [COMPLETED_ITEM_2]\n\n🔄 In Progress:\n- [IN_PROGRESS_ITEM]\n\n📅 Next Steps:\n- [NEXT_STEP]\n\nLet me know if you have any questions or feedback!\n\nBest regards`
            },
            followup: {
                subject: 'Following Up - [TOPIC]',
                body: `Hi [NAME],\n\nI wanted to follow up on our previous conversation about [TOPIC].\n\nDo you have any updates or questions you'd like to discuss?\n\nLooking forward to hearing from you.\n\nBest regards`
            }
        };

        const tpl = templates[template];
        if (!subject) setSubject(tpl.subject);
        setBody(tpl.body);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                style={{
                    background: 'var(--admin-card-bg, #1a1a1a)',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '700px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid var(--admin-border-color, #333)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--admin-border-color, #333)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--admin-hover-bg, #222)'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent, #a3ff00)" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                        {replyTo ? 'Reply' : 'New Email'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            padding: '0.25rem'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        margin: '1rem 1.5rem 0',
                        padding: '0.75rem 1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        fontSize: '0.85rem'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <div
                    ref={dropZoneRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}
                >
                    {/* To Field */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ width: '60px', color: '#888', fontSize: '0.85rem' }}>To</label>
                        <input
                            type="text"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            placeholder="recipient@example.com"
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '1px solid var(--admin-border-color, #333)',
                                padding: '0.5rem 0',
                                color: '#fff',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                        {!showCcBcc && (
                            <button
                                onClick={() => setShowCcBcc(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-accent, #a3ff00)',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem'
                                }}
                            >
                                Cc/Bcc
                            </button>
                        )}
                    </div>

                    {/* CC/BCC Fields */}
                    {showCcBcc && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label style={{ width: '60px', color: '#888', fontSize: '0.85rem' }}>Cc</label>
                                <input
                                    type="text"
                                    value={cc}
                                    onChange={(e) => setCc(e.target.value)}
                                    placeholder="cc@example.com"
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid var(--admin-border-color, #333)',
                                        padding: '0.5rem 0',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label style={{ width: '60px', color: '#888', fontSize: '0.85rem' }}>Bcc</label>
                                <input
                                    type="text"
                                    value={bcc}
                                    onChange={(e) => setBcc(e.target.value)}
                                    placeholder="bcc@example.com"
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid var(--admin-border-color, #333)',
                                        padding: '0.5rem 0',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </>
                    )}

                    {/* Subject Field */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ width: '60px', color: '#888', fontSize: '0.85rem' }}>Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Email subject"
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '1px solid var(--admin-border-color, #333)',
                                padding: '0.5rem 0',
                                color: '#fff',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Templates Bar */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <span style={{ color: '#666', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>Templates:</span>
                        {(['invoice', 'update', 'followup'] as const).map(tpl => (
                            <button
                                key={tpl}
                                onClick={() => applyTemplate(tpl)}
                                style={{
                                    background: 'var(--admin-hover-bg, #222)',
                                    border: '1px solid var(--admin-border-color, #333)',
                                    borderRadius: '6px',
                                    padding: '0.25rem 0.5rem',
                                    color: '#888',
                                    fontSize: '0.7rem',
                                    textTransform: 'capitalize',
                                    cursor: 'pointer'
                                }}
                            >
                                {tpl}
                            </button>
                        ))}
                    </div>

                    {/* Body */}
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write your message... (or drop files here)"
                        style={{
                            flex: 1,
                            minHeight: '200px',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '0.9rem',
                            outline: 'none',
                            resize: 'none',
                            lineHeight: 1.6
                        }}
                    />

                    {/* Attachments */}
                    {attachments.length > 0 && (
                        <div style={{
                            padding: '1rem',
                            background: 'var(--admin-hover-bg, #222)',
                            borderRadius: '8px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                        }}>
                            {attachments.map(att => (
                                <div
                                    key={att.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 0.75rem',
                                        background: 'var(--admin-card-bg, #1a1a1a)',
                                        border: '1px solid var(--admin-border-color, #333)',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                    </svg>
                                    <span style={{ color: '#ccc' }}>{att.file.name}</span>
                                    <span style={{ color: '#666' }}>({formatSize(att.file.size)})</span>
                                    <button
                                        onClick={() => removeAttachment(att.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '0.1rem'
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--admin-border-color, #333)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--admin-hover-bg, #222)'
                }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--admin-border-color, #333)',
                                borderRadius: '8px',
                                padding: '0.5rem 0.75rem',
                                color: '#888',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.8rem'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                            Attach
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={(e) => handleFileSelect(e.target.files)}
                            style={{ display: 'none' }}
                        />
                        <button
                            onClick={generateAiDraft}
                            disabled={aiLoading}
                            style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.5rem 0.75rem',
                                color: '#fff',
                                cursor: aiLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.8rem',
                                opacity: aiLoading ? 0.6 : 1
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                            {aiLoading ? 'Generating...' : 'AI Draft'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--admin-border-color, #333)',
                                borderRadius: '8px',
                                padding: '0.5rem 1rem',
                                color: '#888',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={sending}
                            style={{
                                background: 'var(--color-accent, #a3ff00)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.5rem 1.25rem',
                                color: '#000',
                                fontWeight: 600,
                                cursor: sending ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.85rem',
                                opacity: sending ? 0.6 : 1
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                            {sending ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailComposeModal;
