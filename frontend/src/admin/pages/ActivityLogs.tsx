import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    userId: string;
    details: string;
    createdAt: string;
    user?: {
        name: string;
        email: string;
    };
}

const ActivityLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    const fetchLogs = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await api.get(`/audit-logs?page=${pageNum}&limit=20`);
            setLogs(res.data.data || []);
            setTotalPages(res.data.meta?.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch audit logs', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="admin-page-header">
                <h1 className="admin-page-title">Activity Logs</h1>
                <p className="admin-page-subtitle">Track all system actions and changes.</p>
            </div>

            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    gap: '1rem',
                    background: 'var(--admin-hover-bg)',
                    borderBottom: '1px solid var(--admin-border-color)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#888'
                }}>
                    <span style={{ width: '180px' }}>Date</span>
                    <span style={{ width: '150px' }}>User</span>
                    <span style={{ width: '120px' }}>Action</span>
                    <span style={{ width: '120px' }}>Entity</span>
                    <span style={{ flex: 1 }}>Details</span>
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading logs...</div>
                ) : logs.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No activity logs found.</div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '1rem',
                            gap: '1rem',
                            borderBottom: '1px solid var(--admin-border-color)',
                            fontSize: '0.9rem'
                        }}>
                            <span style={{ width: '180px', color: '#666' }}>{new Date(log.createdAt).toLocaleString()}</span>
                            <span style={{ width: '150px', color: '#fff' }}>{log.user?.name || log.userId}</span>
                            <span style={{ width: '120px' }}>
                                <span style={{
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    background: 'rgba(255,255,255,0.1)',
                                    fontSize: '0.75rem'
                                }}>
                                    {log.action}
                                </span>
                            </span>
                            <span style={{ width: '120px', color: '#aaa' }}>{log.entity}</span>
                            <span style={{ flex: 1, color: '#ccc' }}>{log.details || '-'}</span>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '1rem' }}>
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="admin-btn admin-btn-secondary"
                >
                    Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', color: '#888' }}>
                    Page {page} of {totalPages}
                </span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="admin-btn admin-btn-secondary"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ActivityLogsPage;
