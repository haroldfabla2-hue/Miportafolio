import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cmsAdminApi } from '../../services/api';

// Content type options
const contentTypes = [
    { value: 'PORTFOLIO', label: 'Portfolio Project' },
    { value: 'BLOG', label: 'Blog Post' },
    { value: 'PAGE', label: 'Static Page' },
    { value: 'REPORT', label: 'Report' },
];

// Status options
const statusOptions = [
    { value: 'DRAFT', label: 'Draft', color: '#888' },
    { value: 'PUBLISHED', label: 'Published', color: '#22c55e' },
    { value: 'ARCHIVED', label: 'Archived', color: '#f59e0b' },
];

const ContentEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id, type: routeType } = useParams<{ id?: string; type?: string }>();
    const isEditing = !!id;

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        type: routeType || 'PORTFOLIO',
        content: '',
        metaTitle: '',
        metaDesc: '',
        coverImage: '',
        tags: [] as string[],
        status: 'DRAFT',
        metadata: {
            year: new Date().getFullYear().toString(),
            url: '',
            role: '',
            services: [] as string[],
        },
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tagInput, setTagInput] = useState('');
    const [serviceInput, setServiceInput] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);

    // Load content if editing
    useEffect(() => {
        if (isEditing && id) {
            loadContent();
        }
    }, [id]);

    const loadContent = async () => {
        setLoading(true);
        try {
            const content = await cmsAdminApi.getOne(id!);
            setFormData({
                title: content.title,
                slug: content.slug,
                type: content.type,
                content: content.content,
                metaTitle: content.metaTitle || '',
                metaDesc: content.metaDesc || '',
                coverImage: content.coverImage || '',
                tags: content.tags || [],
                status: content.status,
                metadata: {
                    year: content.metadata?.year || new Date().getFullYear().toString(),
                    url: content.metadata?.url || '',
                    role: content.metadata?.role || '',
                    services: content.metadata?.services || [],
                },
            });
        } catch (err: any) {
            console.error('Failed to load content:', err);
            setError('Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    // Generate slug from title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 100);
    };

    const handleTitleChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            title: value,
            slug: !isEditing || !prev.slug ? generateSlug(value) : prev.slug,
        }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()],
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag),
        }));
    };

    const handleAddService = () => {
        if (serviceInput.trim() && !formData.metadata.services.includes(serviceInput.trim())) {
            setFormData(prev => ({
                ...prev,
                metadata: {
                    ...prev.metadata,
                    services: [...prev.metadata.services, serviceInput.trim()],
                },
            }));
            setServiceInput('');
        }
    };

    const handleRemoveService = (service: string) => {
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                services: prev.metadata.services.filter(s => s !== service),
            },
        }));
    };

    const handleSave = async (publish = false) => {
        setSaving(true);
        setError(null);

        try {
            const dataToSave = {
                ...formData,
                status: publish ? 'PUBLISHED' : formData.status,
                publishedAt: publish ? new Date().toISOString() : undefined,
            };

            if (isEditing) {
                await cmsAdminApi.update(id!, dataToSave);
            } else {
                await cmsAdminApi.create(dataToSave);
            }

            navigate('/admin/cms');
        } catch (err: any) {
            console.error('Failed to save content:', err);
            setError(err.response?.data?.message || 'Failed to save content');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-content">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <div className="admin-skeleton" style={{ width: '100%', maxWidth: '800px', height: '400px' }} />
                </div>
            </div>
        );
    }

    const isPortfolio = formData.type === 'PORTFOLIO';

    return (
        <div className="admin-content">
            {/* Header */}
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <button
                        onClick={() => navigate('/admin/cms')}
                        className="admin-btn admin-btn-ghost"
                        style={{ marginBottom: '0.5rem', padding: '0.25rem 0' }}
                    >
                        ← Back to Content Manager
                    </button>
                    <h1 className="admin-page-title">
                        {isEditing ? 'Edit Content' : `New ${formData.type}`}
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="admin-btn admin-btn-ghost"
                        onClick={() => setPreviewOpen(true)}
                        disabled={!formData.title}
                    >
                        👁️ Preview
                    </button>
                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        data-tooltip="Save your progress without publishing"
                    >
                        {saving ? 'Saving...' : '💾 Save Draft'}
                    </button>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        data-tooltip="Make this content live on your public site"
                    >
                        {saving ? 'Publishing...' : '📢 Publish'}
                    </button>
                </div>
            </div>

            {/* Error */}
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

            {/* Form Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Title */}
                    <div className="admin-card">
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                            Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Enter title..."
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--admin-border-color)',
                                background: 'var(--admin-bg)',
                                color: '#fff',
                                fontSize: '1.25rem',
                                fontWeight: 600
                            }}
                        />
                    </div>

                    {/* Slug */}
                    <div className="admin-card">
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                            Slug (URL)
                        </label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                            placeholder="url-friendly-slug"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--admin-border-color)',
                                background: 'var(--admin-bg)',
                                color: '#fff',
                                fontFamily: 'monospace'
                            }}
                        />
                    </div>

                    {/* Content */}
                    <div className="admin-card">
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                            Content
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Write your content here..."
                            rows={12}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--admin-border-color)',
                                background: 'var(--admin-bg)',
                                color: '#fff',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                lineHeight: 1.6
                            }}
                        />
                    </div>

                    {/* SEO Section */}
                    <div className="admin-card">
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>
                            🔍 SEO Settings
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '0.25rem' }}>Meta Title</label>
                                <input
                                    type="text"
                                    value={formData.metaTitle}
                                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                                    placeholder="Page title for search engines"
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        border: '1px solid var(--admin-border-color)',
                                        background: 'var(--admin-bg)',
                                        color: '#fff'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '0.25rem' }}>Meta Description</label>
                                <textarea
                                    value={formData.metaDesc}
                                    onChange={(e) => setFormData(prev => ({ ...prev, metaDesc: e.target.value }))}
                                    placeholder="Brief description for search results"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        border: '1px solid var(--admin-border-color)',
                                        background: 'var(--admin-bg)',
                                        color: '#fff',
                                        resize: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Status & Type */}
                    <div className="admin-card">
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>
                            📋 Publishing
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '0.25rem' }}>Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                    disabled={isEditing}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        border: '1px solid var(--admin-border-color)',
                                        background: 'var(--admin-bg)',
                                        color: '#fff'
                                    }}
                                >
                                    {contentTypes.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '0.25rem' }}>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        border: '1px solid var(--admin-border-color)',
                                        background: 'var(--admin-bg)',
                                        color: '#fff'
                                    }}
                                >
                                    {statusOptions.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="admin-card">
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>
                            🖼️ Cover Image
                        </h3>
                        <input
                            type="text"
                            value={formData.coverImage}
                            onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                            placeholder="/projects/project-1.png"
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                border: '1px solid var(--admin-border-color)',
                                background: 'var(--admin-bg)',
                                color: '#fff',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem'
                            }}
                        />
                        {formData.coverImage && (
                            <div style={{ marginTop: '0.75rem', borderRadius: '8px', overflow: 'hidden' }}>
                                <img
                                    src={formData.coverImage}
                                    alt="Cover preview"
                                    style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="admin-card">
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>
                            🏷️ Tags
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                placeholder="Add tag..."
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--admin-border-color)',
                                    background: 'var(--admin-bg)',
                                    color: '#fff'
                                }}
                            />
                            <button onClick={handleAddTag} className="admin-btn admin-btn-secondary" style={{ padding: '0.5rem' }}>+</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {formData.tags.map(tag => (
                                <span key={tag} style={{
                                    padding: '0.25rem 0.5rem',
                                    background: 'var(--admin-hover-bg)',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}>
                                    {tag}
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }}
                                    >×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Portfolio-specific fields */}
                    {isPortfolio && (
                        <div className="admin-card">
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>
                                💼 Portfolio Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '0.25rem' }}>Year</label>
                                    <input
                                        type="text"
                                        value={formData.metadata.year}
                                        onChange={(e) => setFormData(prev => ({ ...prev, metadata: { ...prev.metadata, year: e.target.value } }))}
                                        placeholder="2024"
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            border: '1px solid var(--admin-border-color)',
                                            background: 'var(--admin-bg)',
                                            color: '#fff'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '0.25rem' }}>Project URL</label>
                                    <input
                                        type="text"
                                        value={formData.metadata.url}
                                        onChange={(e) => setFormData(prev => ({ ...prev, metadata: { ...prev.metadata, url: e.target.value } }))}
                                        placeholder="https://example.com"
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            border: '1px solid var(--admin-border-color)',
                                            background: 'var(--admin-bg)',
                                            color: '#fff'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '0.25rem' }}>Your Role</label>
                                    <input
                                        type="text"
                                        value={formData.metadata.role}
                                        onChange={(e) => setFormData(prev => ({ ...prev, metadata: { ...prev.metadata, role: e.target.value } }))}
                                        placeholder="Lead Developer"
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            border: '1px solid var(--admin-border-color)',
                                            background: 'var(--admin-bg)',
                                            color: '#fff'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '0.25rem' }}>Services</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={serviceInput}
                                            onChange={(e) => setServiceInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                                            placeholder="Add service..."
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                borderRadius: '6px',
                                                border: '1px solid var(--admin-border-color)',
                                                background: 'var(--admin-bg)',
                                                color: '#fff'
                                            }}
                                        />
                                        <button onClick={handleAddService} className="admin-btn admin-btn-secondary" style={{ padding: '0.5rem' }}>+</button>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {formData.metadata.services.map(service => (
                                            <span key={service} style={{
                                                padding: '0.25rem 0.5rem',
                                                background: 'rgba(163, 255, 0, 0.1)',
                                                border: '1px solid rgba(163, 255, 0, 0.3)',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                color: '#a3ff00',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                {service}
                                                <button
                                                    onClick={() => handleRemoveService(service)}
                                                    style={{ background: 'none', border: 'none', color: '#a3ff00', cursor: 'pointer', padding: 0 }}
                                                >×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            {previewOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', zIndex: 9999,
                    overflow: 'auto', padding: '2rem'
                }} onClick={() => setPreviewOpen(false)}>
                    <div style={{
                        maxWidth: '800px', margin: '0 auto',
                        background: '#111', borderRadius: '16px',
                        border: '1px solid #222', overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Preview Header */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '1rem 1.5rem', borderBottom: '1px solid #222'
                        }}>
                            <span style={{ color: '#888', fontSize: '0.85rem' }}>📄 Content Preview</span>
                            <button
                                onClick={() => setPreviewOpen(false)}
                                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.25rem' }}
                            >✕</button>
                        </div>

                        {/* SEO Preview Card */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #222' }}>
                            <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Google Search Preview</div>
                            <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '1rem' }}>
                                <div style={{ color: '#8ab4f8', fontSize: '1.1rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {formData.metaTitle || formData.title || 'Page Title'}
                                </div>
                                <div style={{ color: '#bdc1c6', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                    haroldfabla.com/{formData.type === 'BLOG' ? 'blog' : formData.type === 'PORTFOLIO' ? 'projects' : 'page'}/{formData.slug || 'slug'}
                                </div>
                                <div style={{ color: '#969ba1', fontSize: '0.8rem', lineHeight: 1.4 }}>
                                    {formData.metaDesc || formData.content?.substring(0, 160) || 'No description provided.'}
                                </div>
                            </div>
                        </div>

                        {/* Content Preview */}
                        <div style={{ padding: '2rem 1.5rem' }}>
                            {formData.coverImage && (
                                <img
                                    src={formData.coverImage}
                                    alt={formData.title}
                                    style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem' }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            )}
                            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
                                {formData.title || 'Untitled'}
                            </h1>
                            {formData.tags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    {formData.tags.map(tag => (
                                        <span key={tag} style={{
                                            padding: '0.2rem 0.6rem', background: 'rgba(163,255,0,0.1)',
                                            border: '1px solid rgba(163,255,0,0.3)', borderRadius: '12px',
                                            fontSize: '0.7rem', color: '#a3ff00'
                                        }}>{tag}</span>
                                    ))}
                                </div>
                            )}
                            <div style={{ color: '#ccc', lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                                {formData.content || 'No content yet...'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentEditor;


