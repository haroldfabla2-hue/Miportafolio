import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

// Types
interface Asset {
    id: string;
    name: string;
    type: 'image' | 'video' | 'document' | 'other';
    url: string;
    thumbnailUrl?: string;
    project?: { id: string; name: string };
    status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'REJECTED';
    uploadedBy: string;
    createdAt: string;
}


const statusColors: Record<string, { bg: string; text: string }> = {
    'DRAFT': { bg: 'rgba(107, 114, 128, 0.15)', text: '#888' },
    'REVIEW': { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
    'APPROVED': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' },
    'REJECTED': { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
};

// Asset Card
const AssetCard: React.FC<{ asset: Asset; onSelect: (a: Asset) => void }> = ({ asset, onSelect }) => (
    <div
        onClick={() => onSelect(asset)}
        className="admin-card"
        style={{
            padding: 0,
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
        {/* Thumbnail */}
        <div style={{
            height: '160px',
            background: 'var(--admin-hover-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {asset.type === 'image' ? (
                <img
                    src={asset.thumbnailUrl || asset.url}
                    alt={asset.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <span style={{ fontSize: '3rem' }}>
                    {asset.type === 'video' ? '🎬' : asset.type === 'document' ? '📄' : '📎'}
                </span>
            )}
        </div>

        {/* Info */}
        <div style={{ padding: '1rem' }}>
            <h4 style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#fff',
                marginBottom: '0.5rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}>
                {asset.name}
            </h4>
            {asset.project && (
                <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>
                    {asset.project.name}
                </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: statusColors[asset.status].bg,
                    color: statusColors[asset.status].text
                }}>
                    {asset.status}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#555' }}>
                    {new Date(asset.createdAt).toLocaleDateString()}
                </span>
            </div>
        </div>
    </div>
);

// Asset Detail Modal
const AssetModal: React.FC<{ asset: Asset; onClose: () => void; onUpdateStatus: (status: string) => void }> = ({ asset, onClose, onUpdateStatus }) => (
    <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
    }}>
        <div style={{
            background: 'var(--admin-card-bg)',
            border: '1px solid var(--admin-border-color)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--admin-border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{asset.name}</h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Preview */}
            <div style={{
                flex: 1,
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px'
            }}>
                {asset.type === 'image' ? (
                    <img src={asset.url} alt={asset.name} style={{ maxWidth: '100%', maxHeight: '400px' }} />
                ) : asset.type === 'video' ? (
                    <video src={asset.url} controls style={{ maxWidth: '100%', maxHeight: '400px' }} />
                ) : (
                    <span style={{ fontSize: '4rem' }}>📄</span>
                )}
            </div>

            {/* Actions */}
            <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--admin-border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => onUpdateStatus('APPROVED')}
                        className="admin-btn admin-btn-primary"
                    >
                        ✓ Approve
                    </button>
                    <button
                        onClick={() => onUpdateStatus('REJECTED')}
                        className="admin-btn admin-btn-secondary"
                        style={{ color: '#ef4444' }}
                    >
                        ✕ Reject
                    </button>
                </div>
                <a
                    href={asset.url}
                    download
                    className="admin-btn admin-btn-secondary"
                >
                    Download
                </a>
            </div>
        </div>
    </div>
);

// Main Assets Page
const AssetsPage: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [filter, setFilter] = useState<'all' | 'REVIEW' | 'APPROVED'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const res = await api.get('/assets');
            setAssets(res.data);
        } catch (error) {
            console.error('Failed to fetch assets', error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | DragEvent) => {
        let file: File | null = null;
        if ('dataTransfer' in e) { // DragEvent
            file = e.dataTransfer?.files[0] || null;
        } else {
            file = e.target.files?.[0] || null;
        }

        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);

        try {
            const res = await api.post('/assets', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data) {
                await fetchAssets();
            }
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setUploading(false);
            setDragActive(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e as any); // Cast to any to reuse handler logic simply
        }
    };

    const displayAssets = assets;
    let filteredAssets = displayAssets;
    if (filter !== 'all') filteredAssets = filteredAssets.filter(a => a.status === filter);
    if (typeFilter !== 'all') filteredAssets = filteredAssets.filter(a => a.type === typeFilter);

    const updateStatus = async (assetId: string, status: string) => {
        try {
            await api.patch(`/assets/${assetId}`, { status });
            await fetchAssets();
            setSelectedAsset(null);
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    return (
        <div>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="admin-page-title">Assets</h1>
                    <p className="admin-page-subtitle">Manage and review digital assets.</p>
                </div>
                <div
                    style={{ position: 'relative' }}
                    onDragEnter={handleDrag}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <>
                                <span className="admin-spinner" style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', display: 'inline-block', marginRight: 8, animation: 'spin 1s linear infinite' }} />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Upload Asset
                            </>
                        )}
                    </button>
                    {dragActive && (
                        <div
                            style={{ position: 'absolute', top: -10, left: -10, right: -10, bottom: -10, background: 'rgba(163, 255, 0, 0.2)', border: '2px dashed #a3ff00', borderRadius: 8, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
                        >
                            <span style={{ fontWeight: 600, color: '#a3ff00' }}>Drop file here</span>
                        </div>
                    )}
                    {dragActive && <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} />}
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['all', 'REVIEW', 'APPROVED'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`admin - btn ${filter === f ? 'admin-btn-primary' : 'admin-btn-secondary'} `}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        >
                            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['all', 'image', 'video', 'document'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`admin - btn ${typeFilter === t ? 'admin-btn-primary' : 'admin-btn-secondary'} `}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        >
                            {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Assets Grid */}
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                {filteredAssets.map(asset => (
                    <AssetCard key={asset.id} asset={asset} onSelect={setSelectedAsset} />
                ))}
            </div>

            {/* Modal */}
            {selectedAsset && (
                <AssetModal
                    asset={selectedAsset}
                    onClose={() => setSelectedAsset(null)}
                    onUpdateStatus={(status) => updateStatus(selectedAsset.id, status)}
                />
            )}
        </div>
    );
};

export default AssetsPage;
