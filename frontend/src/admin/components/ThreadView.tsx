import React, { useState } from 'react';

interface ThreadMessage {
    id: string;
    from: { name: string; email: string };
    to: { name?: string; email: string }[];
    subject: string;
    body: string;
    bodyHtml?: string;
    date: string;
    isRead: boolean;
    attachments?: { filename: string; size: number; url?: string }[];
}

interface ThreadViewProps {
    messages: ThreadMessage[];
    onReply: (message: ThreadMessage) => void;
    onReplyAll: (message: ThreadMessage) => void;
    onForward: (message: ThreadMessage) => void;
    onArchive: () => void;
    onDelete: () => void;
    onBack: () => void;
    onQuickReply?: (body: string) => Promise<void>;
}

const ThreadView: React.FC<ThreadViewProps> = ({
    messages,
    onReply,
    onReplyAll,
    onForward,
    onArchive,
    onDelete,
    onBack,
    onQuickReply
}) => {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(
        new Set([messages[messages.length - 1]?.id]) // Last message expanded by default
    );
    const [quickReplyText, setQuickReplyText] = useState('');
    const [aiResult, setAiResult] = useState<{ type: string; content: string } | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);
    const [sendingQuickReply, setSendingQuickReply] = useState(false);

    const latestMessage = messages[messages.length - 1];

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleQuickReply = async () => {
        if (!quickReplyText.trim() || !onQuickReply) return;
        setSendingQuickReply(true);
        try {
            await onQuickReply(quickReplyText);
            setQuickReplyText('');
        } finally {
            setSendingQuickReply(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleAiAction = async (action: 'summarize' | 'reply' | 'analyze') => {
        if (!latestMessage) return;
        setLoadingAi(true);
        setAiResult(null);
        try {
            const response = await fetch('/api/iris/email-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: latestMessage.body,
                    type: action,
                    context: {
                        subject: latestMessage.subject,
                        sender: latestMessage.from.name
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                setAiResult({ type: action, content: data.result });

                // If reply, automatically fill quick reply
                if (action === 'reply' && onQuickReply) {
                    setQuickReplyText(data.result);
                }
            }
        } catch (error) {
            console.error('AI action failed:', error);
        } finally {
            setLoadingAi(false);
        }
    };

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--admin-card-bg, #1a1a1a)'
        }}>
            {/* Header Toolbar */}
            <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--admin-border-color, #333)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'var(--admin-hover-bg, #222)'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex'
                    }}
                    title="Back to inbox"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>
                        {latestMessage?.subject}
                    </h2>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>
                        {messages.length} message{messages.length !== 1 ? 's' : ''} in this thread
                    </span>
                </div>

                {/* AI Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem', borderRight: '1px solid #333', paddingRight: '1rem' }}>
                    <button
                        onClick={() => handleAiAction('summarize')}
                        disabled={loadingAi}
                        style={{
                            background: 'rgba(163, 255, 0, 0.1)',
                            border: '1px solid rgba(163, 255, 0, 0.2)',
                            borderRadius: '6px',
                            padding: '0.4rem 0.8rem',
                            color: 'var(--color-accent, #a3ff00)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: loadingAi ? 'wait' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.3rem'
                        }}
                    >
                        <span>✨ Summarize</span>
                    </button>
                    <button
                        onClick={() => handleAiAction('reply')}
                        disabled={loadingAi}
                        style={{
                            background: 'rgba(163, 255, 0, 0.1)',
                            border: '1px solid rgba(163, 255, 0, 0.2)',
                            borderRadius: '6px',
                            padding: '0.4rem 0.8rem',
                            color: 'var(--color-accent, #a3ff00)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: loadingAi ? 'wait' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.3rem'
                        }}
                    >
                        <span>↩️ AI Reply</span>
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={onArchive}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--admin-border-color, #333)',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            color: '#888',
                            cursor: 'pointer'
                        }}
                        title="Archive"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="21 8 21 21 3 21 3 8" />
                            <rect x="1" y="3" width="22" height="5" />
                            <line x1="10" y1="12" x2="14" y2="12" />
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--admin-border-color, #333)',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            color: '#ef4444',
                            cursor: 'pointer'
                        }}
                        title="Delete"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* AI Result Area */}
            {aiResult && aiResult.type !== 'reply' && (
                <div style={{
                    margin: '1rem 1.5rem',
                    padding: '1rem',
                    background: 'rgba(163, 255, 0, 0.05)',
                    border: '1px dashed var(--color-accent, #a3ff00)',
                    borderRadius: '8px',
                    position: 'relative'
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-accent, #a3ff00)',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase'
                    }}>
                        AI {aiResult.type === 'summarize' ? 'Summary' : 'Analysis'}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#ddd', lineHeight: 1.5 }}>
                        {aiResult.content}
                    </p>
                    <button
                        onClick={() => setAiResult(null)}
                        style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Messages List */}
            <div style={{ flex: 1, overflow: 'auto', padding: '1rem 1.5rem' }}>
                {messages.map((message, index) => {
                    const isExpanded = expandedIds.has(message.id);
                    const isLast = index === messages.length - 1;

                    return (
                        <div
                            key={message.id}
                            style={{
                                marginBottom: isLast ? 0 : '0.5rem',
                                border: '1px solid var(--admin-border-color, #333)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                background: isExpanded ? 'var(--admin-card-bg, #1a1a1a)' : 'var(--admin-hover-bg, #222)'
                            }}
                        >
                            {/* Message Header (always visible) */}
                            <div
                                onClick={() => toggleExpand(message.id)}
                                style={{
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--color-accent, #a3ff00) 0%, #22c55e 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#000',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    flexShrink: 0
                                }}>
                                    {message.from.name.charAt(0).toUpperCase()}
                                </div>

                                {/* Sender Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                        <span style={{
                                            fontWeight: message.isRead ? 400 : 600,
                                            color: message.isRead ? '#888' : '#fff',
                                            fontSize: '0.9rem'
                                        }}>
                                            {message.from.name}
                                        </span>
                                        <span style={{ color: '#555', fontSize: '0.75rem' }}>
                                            &lt;{message.from.email}&gt;
                                        </span>
                                    </div>
                                    {!isExpanded && (
                                        <p style={{
                                            margin: '0.25rem 0 0',
                                            color: '#666',
                                            fontSize: '0.85rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {message.body.slice(0, 100)}...
                                        </p>
                                    )}
                                </div>

                                {/* Date & Expand Icon */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                    {message.attachments && message.attachments.length > 0 && (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                        </svg>
                                    )}
                                    <span style={{ color: '#666', fontSize: '0.8rem' }}>
                                        {formatDate(message.date)}
                                    </span>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#666"
                                        strokeWidth="2"
                                        style={{
                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s'
                                        }}
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div style={{ padding: '0 1rem 1rem' }}>
                                    {/* To line */}
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#666',
                                        marginBottom: '1rem',
                                        paddingBottom: '1rem',
                                        borderBottom: '1px solid var(--admin-border-color, #333)'
                                    }}>
                                        To: {message.to.map(t => t.email).join(', ')}
                                    </div>

                                    {/* Body */}
                                    <div
                                        style={{
                                            color: '#ccc',
                                            fontSize: '0.9rem',
                                            lineHeight: 1.7,
                                            whiteSpace: 'pre-wrap'
                                        }}
                                        dangerouslySetInnerHTML={
                                            message.bodyHtml
                                                ? { __html: message.bodyHtml }
                                                : undefined
                                        }
                                    >
                                        {!message.bodyHtml && message.body}
                                    </div>

                                    {/* Attachments */}
                                    {message.attachments && message.attachments.length > 0 && (
                                        <div style={{
                                            marginTop: '1.5rem',
                                            padding: '1rem',
                                            background: 'var(--admin-hover-bg, #222)',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                color: '#666',
                                                textTransform: 'uppercase',
                                                marginBottom: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                                </svg>
                                                {message.attachments.length} Attachment{message.attachments.length !== 1 ? 's' : ''}
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {message.attachments.map((att, i) => (
                                                    <a
                                                        key={i}
                                                        href={att.url || '#'}
                                                        download={att.filename}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            padding: '0.5rem 0.75rem',
                                                            background: 'var(--admin-card-bg, #1a1a1a)',
                                                            border: '1px solid var(--admin-border-color, #333)',
                                                            borderRadius: '6px',
                                                            textDecoration: 'none',
                                                            color: '#ccc',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent, #a3ff00)" strokeWidth="2">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                            <polyline points="14 2 14 8 20 8" />
                                                        </svg>
                                                        <span>{att.filename}</span>
                                                        <span style={{ color: '#666' }}>({formatSize(att.size)})</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Message Actions */}
                                    <div style={{
                                        marginTop: '1.5rem',
                                        display: 'flex',
                                        gap: '0.5rem'
                                    }}>
                                        <button
                                            onClick={() => onReply(message)}
                                            style={{
                                                background: 'var(--color-accent, #a3ff00)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '0.5rem 1rem',
                                                color: '#000',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="9 17 4 12 9 7" />
                                                <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                                            </svg>
                                            Reply
                                        </button>
                                        <button
                                            onClick={() => onReplyAll(message)}
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
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="9 17 4 12 9 7" />
                                                <polyline points="15 17 10 12 15 7" />
                                            </svg>
                                            Reply All
                                        </button>
                                        <button
                                            onClick={() => onForward(message)}
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
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="15 17 20 12 15 7" />
                                                <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
                                            </svg>
                                            Forward
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Quick Reply */}
                {onQuickReply && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        border: '1px solid var(--admin-border-color, #333)',
                        borderRadius: '12px',
                        background: 'var(--admin-hover-bg, #222)'
                    }}>
                        <textarea
                            value={quickReplyText}
                            onChange={(e) => setQuickReplyText(e.target.value)}
                            placeholder="Write a quick reply..."
                            style={{
                                width: '100%',
                                minHeight: '80px',
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontSize: '0.9rem',
                                outline: 'none',
                                resize: 'none',
                                marginBottom: '0.75rem'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleQuickReply}
                                disabled={!quickReplyText.trim() || sendingQuickReply}
                                style={{
                                    background: quickReplyText.trim() ? 'var(--color-accent, #a3ff00)' : '#333',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.5rem 1rem',
                                    color: quickReplyText.trim() ? '#000' : '#666',
                                    fontWeight: 600,
                                    cursor: quickReplyText.trim() && !sendingQuickReply ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    fontSize: '0.8rem'
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                                {sendingQuickReply ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThreadView;
