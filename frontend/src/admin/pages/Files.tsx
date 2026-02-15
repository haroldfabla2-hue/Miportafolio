import React, { useState } from 'react';

// Types
interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'file';
    mimeType?: string;
    size?: number;
    modifiedAt: string;
    thumbnail?: string;
    webViewLink?: string;
}

// File icons by type
const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return '📁';
    if (mimeType.includes('folder')) return '📁';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('document') || mimeType.includes('word')) return '📄';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
    if (mimeType.includes('video')) return '🎬';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
    return '📎';
};

// Format file size
const formatSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// File Row Component
const FileRow: React.FC<{ file: FileItem; onNavigate: (id: string) => void }> = ({ file, onNavigate }) => (
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
        <span style={{ fontSize: '1.5rem' }}>{getFileIcon(file.mimeType)}</span>

        {/* Name */}
        <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 500, color: '#fff', fontSize: '0.9rem' }}>{file.name}</span>
        </div>

        {/* Size */}
        <span style={{ color: '#666', fontSize: '0.8rem', width: '80px', textAlign: 'right' }}>
            {file.type === 'file' ? formatSize(file.size) : '-'}
        </span>

        {/* Modified */}
        <span style={{ color: '#666', fontSize: '0.8rem', width: '120px', textAlign: 'right' }}>
            {new Date(file.modifiedAt).toLocaleDateString()}
        </span>

        {/* Actions */}
        {file.type === 'file' && file.webViewLink && (
            <a
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                    padding: '0.5rem',
                    color: '#666',
                    transition: 'color 0.2s'
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
            </a>
        )}
    </div>
);

// Breadcrumb
const Breadcrumb: React.FC<{ path: { id: string; name: string }[]; onNavigate: (id: string) => void }> = ({ path, onNavigate }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
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
    const [files, setFiles] = useState<FileItem[]>([]); void setFiles;
    const [loading, setLoading] = useState(false); void loading; void setLoading;
    const [currentFolder, setCurrentFolder] = useState('root'); void currentFolder;
    const [path, setPath] = useState([{ id: 'root', name: 'My Drive' }]);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const navigateToFolder = (folderId: string) => {
        // In a real app, fetch files from API
        setCurrentFolder(folderId);
        // Update breadcrumb path
        const existingIndex = path.findIndex(p => p.id === folderId);
        if (existingIndex >= 0) {
            setPath(path.slice(0, existingIndex + 1));
        }
    };

    // Demo data
    const demoFiles: FileItem[] = [
        { id: 'f1', name: 'Clients', type: 'folder', mimeType: 'application/vnd.google-apps.folder', modifiedAt: '2024-01-15' },
        { id: 'f2', name: 'Projects', type: 'folder', mimeType: 'application/vnd.google-apps.folder', modifiedAt: '2024-01-17' },
        { id: 'f3', name: 'Assets', type: 'folder', mimeType: 'application/vnd.google-apps.folder', modifiedAt: '2024-01-10' },
        { id: 'f4', name: 'Contracts', type: 'folder', mimeType: 'application/vnd.google-apps.folder', modifiedAt: '2024-01-08' },
        { id: 'd1', name: 'Project Proposal - Nuestras Casas.pdf', type: 'file', mimeType: 'application/pdf', size: 2500000, modifiedAt: '2024-01-16', webViewLink: '#' },
        { id: 'd2', name: 'Brand Guidelines - Bijou Me.docx', type: 'file', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1200000, modifiedAt: '2024-01-14', webViewLink: '#' },
        { id: 'd3', name: 'Invoice Template.xlsx', type: 'file', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 45000, modifiedAt: '2024-01-12', webViewLink: '#' },
        { id: 'd4', name: 'Homepage Mockup.png', type: 'file', mimeType: 'image/png', size: 3200000, modifiedAt: '2024-01-17', webViewLink: '#' },
        { id: 'd5', name: 'Meeting Recording.mp4', type: 'file', mimeType: 'video/mp4', size: 125000000, modifiedAt: '2024-01-11', webViewLink: '#' },
    ];

    const displayFiles = files.length > 0 ? files : demoFiles;
    const folders = displayFiles.filter(f => f.type === 'folder');
    const regularFiles = displayFiles.filter(f => f.type === 'file');

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
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`admin-btn ${viewMode === 'grid' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                        style={{ padding: '0.5rem' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                        </svg>
                    </button>
                    <button className="admin-btn admin-btn-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload
                    </button>
                </div>
            </div>

            {/* Breadcrumb */}
            <Breadcrumb path={path} onNavigate={navigateToFolder} />

            {/* Files List */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    gap: '1rem',
                    borderBottom: '1px solid var(--admin-border-color)',
                    background: 'var(--admin-hover-bg)'
                }}>
                    <span style={{ width: '1.5rem' }}></span>
                    <span style={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Name</span>
                    <span style={{ width: '80px', fontSize: '0.75rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', textAlign: 'right' }}>Size</span>
                    <span style={{ width: '120px', fontSize: '0.75rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', textAlign: 'right' }}>Modified</span>
                    <span style={{ width: '40px' }}></span>
                </div>

                {/* Folders first, then files */}
                {[...folders, ...regularFiles].map(file => (
                    <FileRow key={file.id} file={file} onNavigate={(id) => {
                        setPath([...path, { id, name: file.name }]);
                        navigateToFolder(id);
                    }} />
                ))}
            </div>
        </div>
    );
};

export default FilesPage;
