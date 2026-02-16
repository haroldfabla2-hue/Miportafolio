import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Types
interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'file';
    mimeType?: string;
    size?: string;
    modified: string; // ISO string
    thumbnailLink?: string;
    webViewLink?: string;
    iconLink?: string;
}

// File icons by type
const getFileIcon = (file: FileItem) => {
    if (file.thumbnailLink) return <img src={file.thumbnailLink} alt={file.name} style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 4 }} />;
    if (file.iconLink) return <img src={file.iconLink} alt="" style={{ width: 24, height: 24 }} />;

    // Fallback
    const mimeType = file.mimeType || '';
    if (file.type === 'folder') return '📁';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('pdf')) return '📕';
    return '📄';
};

// File Row Component
const FileRow: React.FC<{ file: FileItem; onNavigate: (id: string) => void; onDelete: (id: string) => void }> = ({ file, onNavigate, onDelete }) => (
    <div
        onClick={() => file.type === 'folder' && onNavigate(file.id)}
        style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.875rem 1rem',
            gap: '1rem',
            borderBottom: '1px solid var(--admin-border-color)',
            cursor: file.type === 'folder' ? 'pointer' : 'default',
            transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-hover-bg)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
        {/* Icon */}
        <div style={{ width: 32, display: 'flex', justifyContent: 'center' }}>
            {getFileIcon(file)}
        </div>

        {/* Name */}
        <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 500, color: '#fff', fontSize: '0.9rem' }}>{file.name}</span>
        </div>

        {/* Size */}
        <span style={{ color: '#666', fontSize: '0.8rem', width: '80px', textAlign: 'right' }}>
            {file.size || '-'}
        </span>

        {/* Modified */}
        <span style={{ color: '#666', fontSize: '0.8rem', width: '120px', textAlign: 'right' }}>
            {new Date(file.modified).toLocaleDateString()}
        </span>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
            {file.webViewLink && (
                <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: '0.5rem', color: '#666', transition: 'color 0.2s' }}
                    title="Open in Drive"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                </a>
            )}
            <button
                onClick={() => onDelete(file.id)}
                style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '0.5rem' }}
                title="Delete"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
    </div>
);

// Breadcrumb
const Breadcrumb: React.FC<{ path: { id: string; name: string }[]; onNavigate: (id: string) => void }> = ({ path, onNavigate }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {path.map((item, index) => (
            <React.Fragment key={item.id}>
                {index > 0 && <span style={{ color: '#555' }}>/</span>}
                <button
                    onClick={() => onNavigate(item.id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: index === path.length - 1 ? '#fff' : '#888',
                        fontWeight: index === path.length - 1 ? 600 : 400,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px'
                    }}
                >
                    {item.name}
                </button>
            </React.Fragment>
        ))}
    </div>
);

// Main Files Page
const FilesPage: React.FC = () => {
    const { user } = useAuth();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentFolder, setCurrentFolder] = useState('root');
    const [path, setPath] = useState([{ id: 'root', name: 'My Drive' }]);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (user?.googleConnected) {
            fetchFiles(currentFolder);
        }
    }, [currentFolder, user?.googleConnected]);

    const fetchFiles = async (folderId: string) => {
        setLoading(true);
        try {
            // Only pass folderId if it's not root, or let backend handle logical default
            const params: any = {};
            if (folderId !== 'root') params.folderId = folderId;

            const res = await api.get('/google/drive/files', { params });
            setFiles(res.data);
        } catch (error) {
            console.error('Failed to fetch files', error);
            // Optionally handle 401/403 for not connected
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (folderId: string) => {
        setCurrentFolder(folderId);
        // Find if folder is already in path (going back)
        const pathIndex = path.findIndex(p => p.id === folderId);
        if (pathIndex !== -1) {
            setPath(path.slice(0, pathIndex + 1));
        } else {
            // Find folder name from current files to add to path
            const folder = files.find(f => f.id === folderId);
            if (folder) {
                setPath([...path, { id: folder.id, name: folder.name }]);
            }
        }
    };

    const handleDelete = async (fileId: string) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await api.delete(`/google/drive/files/${fileId}`);
            setFiles(prev => prev.filter(f => f.id !== fileId));
        } catch (error) {
            console.error('Delete failed', error);
            alert('Failed to delete file');
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        if (currentFolder !== 'root') {
            formData.append('folderId', currentFolder);
        }

        setIsUploading(true);
        try {
            await api.post('/google/drive/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchFiles(currentFolder); // Refresh
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    // --- STATES ---

    // 1. Not Connected
    if (!user?.googleConnected) {
        return (
            <div style={{
                height: '80vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>☁️</div>
                <h2>Connect Google Drive</h2>
                <p style={{ marginBottom: '2rem' }}>Access your files directly from the CRM.</p>
                <a href="/admin/settings" className="admin-btn admin-btn-primary">
                    Go to Settings to Connect
                </a>
            </div>
        );
    }

    return (
        <div>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="admin-page-title">Files & Drive</h1>
                    <p className="admin-page-subtitle">Access your Google Drive files.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`admin-btn ${viewMode === 'list' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                        style={{ padding: '0.5rem' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                    </button>

                    <label className="admin-btn admin-btn-primary" style={{ cursor: 'pointer' }}>
                        {isUploading ? 'Uploading...' : 'Upload'}
                        <input type="file" onChange={handleUpload} style={{ display: 'none' }} disabled={isUploading} />
                    </label>
                </div>
            </div>

            {/* Breadcrumb */}
            <Breadcrumb path={path} onNavigate={handleNavigate} />

            {/* Files List */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden', minHeight: '400px' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <div className="spinner" style={{ marginBottom: '1rem', width: '2rem', height: '2rem', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        Loading files...
                    </div>
                ) : files.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📂</div>
                        <p>This folder is empty</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            gap: '1rem',
                            borderBottom: '1px solid var(--admin-border-color)',
                            background: 'var(--admin-hover-bg)'
                        }}>
                            <span style={{ width: '32px' }}></span>
                            <span style={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Name</span>
                            <span style={{ width: '80px', fontSize: '0.75rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', textAlign: 'right' }}>Size</span>
                            <span style={{ width: '120px', fontSize: '0.75rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', textAlign: 'right' }}>Modified</span>
                            <span style={{ width: '60px' }}></span>
                        </div>
                        {files.map(file => (
                            <FileRow
                                key={file.id}
                                file={file}
                                onNavigate={handleNavigate}
                                onDelete={handleDelete}
                            />
                        ))}
                    </>
                )}
            </div>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default FilesPage;
