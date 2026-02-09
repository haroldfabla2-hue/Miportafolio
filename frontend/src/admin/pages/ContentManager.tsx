import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cmsAdminApi } from '../../services/api';
import type { CmsContent } from '../../types/cms';

// Types
interface ContentListResponse {
    items: CmsContent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Status badge colors
const statusColors: Record<string, { bg: string; text: string }> = {
    'DRAFT': { bg: 'rgba(107, 114, 128, 0.15)', text: '#888' },
    'PUBLISHED': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' },
    'ARCHIVED': { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
};

// Type badge colors
const typeColors: Record<string, { bg: string; text: string }> = {
    'PORTFOLIO': { bg: 'rgba(163, 255, 0, 0.15)', text: '#a3ff00' },
    'BLOG': { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
    'PAGE': { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' },
    'REPORT': { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
};

// Content Card Component
const ContentCard: React.FC<{
    content: CmsContent;
    onEdit: () => void;
    onTogglePublish: () => void;
    onDelete: () => void;
}> = ({ content, onEdit, onTogglePublish, onDelete }) => (
    <div
        className="admin-card"
        style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
        onClick={onEdit}
    >
        {/* Cover Image */}
        <div style={{
            height: '140px',
            background: 'var(--admin-hover-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {content.coverImage ? (
                <img
                    src={content.coverImage}
                    alt={content.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            ) : (
                <span style={{ fontSize: '2.5rem', opacity: 0.3 }}>📄</span>
            )}
        </div>

        {/* Content Info */}
        <div style={{ padding: '1rem' }}>
            {/* Type & Status Badges */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: typeColors[content.type]?.bg || 'rgba(107, 114, 128, 0.15)',
                    color: typeColors[content.type]?.text || '#888'
                }}>
                    {content.type}
                </span>
                <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: statusColors[content.status]?.bg || 'rgba(107, 114, 128, 0.15)',
                    color: statusColors[content.status]?.text || '#888'
                }}>
                    {content.status}
                </span>
            </div>

            {/* Title */}
            <h4 style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#fff',
                marginBottom: '0.5rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}>
                {content.title}
            </h4>

            {/* Slug */}
            <p style={{
                fontSize: '0.75rem',
                color: '#666',
                marginBottom: '0.75rem',
                fontFamily: 'monospace'
            }}>
                /{content.slug}
            </p>

            {/* Actions */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                borderTop: '1px solid var(--admin-border-color)',
                paddingTop: '0.75rem',
                marginTop: '0.5rem'
            }}>
                <button
                    onClick={(e) => { e.stopPropagation(); onTogglePublish(); }}
                    className="admin-btn admin-btn-ghost"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', flex: 1 }}
                >
                    {content.status === 'PUBLISHED' ? '📤 Unpublish' : '📢 Publish'}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="admin-btn admin-btn-ghost"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: '#ef4444' }}
                >
                    🗑️
                </button>
            </div>
        </div>
    </div>
);

// Main Component
const ContentManager: React.FC = () => {
    const navigate = useNavigate();
    const [contents, setContents] = useState<CmsContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [activeType, setActiveType] = useState<string>('all');
    const [activeStatus, setActiveStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchContent = async () => {
        setLoading(true);
        setError(null);
        try {
            const response: ContentListResponse = await cmsAdminApi.getAll({
                type: activeType !== 'all' ? activeType : undefined,
                status: activeStatus !== 'all' ? activeStatus : undefined,
                search: searchTerm || undefined,
                page,
                limit: 12,
            });
            setContents(response.items);
            setTotalPages(response.totalPages);
            setTotal(response.total);
        } catch (err: any) {
            console.error('Failed to fetch content:', err);
            setError(err.response?.data?.message || 'Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, [activeType, activeStatus, page]);

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (page === 1) {
                fetchContent();
            } else {
                setPage(1);
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const handleTogglePublish = async (content: CmsContent) => {
        try {
            const isPublished = content.status === 'PUBLISHED';
            await cmsAdminApi.togglePublish(content.id, !isPublished);
            fetchContent();
        } catch (err) {
            console.error('Failed to toggle publish:', err);
        }
    };

    const handleDelete = async (content: CmsContent) => {
        if (!window.confirm(`Are you sure you want to delete "${content.title}"?`)) {
            return;
        }
        try {
            await cmsAdminApi.delete(content.id);
            fetchContent();
        } catch (err) {
            console.error('Failed to delete content:', err);
        }
    };

    const contentTypes = ['all', 'PORTFOLIO', 'BLOG', 'PAGE', 'REPORT'];
    const statusOptions = ['all', 'DRAFT', 'PUBLISHED', 'ARCHIVED'];

    return (
        <div className="admin-content">
            {/* Header */}
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="admin-page-title">Content Manager</h1>
                    <p className="admin-page-subtitle">
                        Manage your portfolio, blog posts, and pages. {total > 0 && `${total} items total.`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => navigate('/admin/cms/new/BLOG')}
                    >
                        ✏️ New Blog
                    </button>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => navigate('/admin/cms/new/PORTFOLIO')}
                    >
                        ➕ New Portfolio
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                {/* Type Tabs */}
                <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--admin-card-bg)', padding: '0.25rem', borderRadius: '10px' }}>
                    {contentTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => { setActiveType(type); setPage(1); }}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeType === type ? 'var(--color-accent)' : 'transparent',
                                color: activeType === type ? '#000' : '#888',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {type === 'all' ? 'All' : type.toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Status Filter */}
                <select
                    value={activeStatus}
                    onChange={(e) => { setActiveStatus(e.target.value); setPage(1); }}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--admin-border-color)',
                        background: 'var(--admin-card-bg)',
                        color: '#fff',
                        fontSize: '0.85rem'
                    }}
                >
                    {statusOptions.map(status => (
                        <option key={status} value={status}>
                            {status === 'all' ? 'All Status' : status}
                        </option>
                    ))}
                </select>

                {/* Search */}
                <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                    <input
                        type="text"
                        placeholder="Search content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--admin-border-color)',
                            background: 'var(--admin-card-bg)',
                            color: '#fff',
                            fontSize: '0.85rem'
                        }}
                    />
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    borderRadius: '10px',
                    color: '#ef4444',
                    marginBottom: '1.5rem'
                }}>
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="admin-grid admin-grid-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="admin-card admin-skeleton" style={{ height: '280px' }} />
                    ))}
                </div>
            ) : contents.length === 0 ? (
                /* Empty State */
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    color: '#666'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
                    <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No content found</h3>
                    <p>Create your first content to get started.</p>
                </div>
            ) : (
                /* Content Grid */
                <>
                    <div className="admin-grid admin-grid-3">
                        {contents.map(content => (
                            <ContentCard
                                key={content.id}
                                content={content}
                                onEdit={() => navigate(`/admin/cms/edit/${content.id}`)}
                                onTogglePublish={() => handleTogglePublish(content)}
                                onDelete={() => handleDelete(content)}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginTop: '2rem'
                        }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="admin-btn admin-btn-secondary"
                                style={{ opacity: page === 1 ? 0.5 : 1 }}
                            >
                                ← Previous
                            </button>
                            <span style={{ padding: '0.75rem 1rem', color: '#888' }}>
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="admin-btn admin-btn-secondary"
                                style={{ opacity: page === totalPages ? 0.5 : 1 }}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ContentManager;
