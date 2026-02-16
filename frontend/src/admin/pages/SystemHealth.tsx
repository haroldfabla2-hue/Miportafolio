import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface SystemHealth {
    status: 'ok' | 'error' | 'warning';
    info: {
        database: { status: string; message?: string };
        redis: { status: string; message?: string };
        google: { status: string; message?: string };
        uptime: number;
    };
    error?: any;
    details: any;
}

const SystemHealthPage: React.FC = () => {
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchHealth();
    }, []);

    const fetchHealth = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/health');
            setHealth(res.data);
        } catch (error) {
            console.error('Failed to fetch system health', error);
            setHealth({ status: 'error', info: { database: { status: 'unknown' }, redis: { status: 'unknown' }, google: { status: 'unknown' }, uptime: 0 }, error: 'Failed to connect' } as any);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getStatusColor = (status: string) => {
        if (status === 'ok' || status === 'up') return 'var(--status-success)';
        if (status === 'warning') return 'var(--status-warning)';
        return 'var(--status-error)';
    };

    const getStatusIcon = (status: string) => {
        if (status === 'ok' || status === 'up') return '✅';
        if (status === 'warning') return '⚠️';
        return '❌';
    };

    if (loading) return <div className="admin-loading">Checking system vitals...</div>;

    return (
        <div>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <h1 className="admin-page-title">System Health</h1>
                    <p className="admin-page-subtitle">Monitor server and services status.</p>
                </div>
                <button
                    onClick={fetchHealth}
                    className="admin-btn admin-btn-secondary"
                    disabled={refreshing}
                >
                    {refreshing ? 'Refreshing...' : 'Refresh Status'}
                </button>
            </div>

            {/* Overall Status */}
            <div className="admin-card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '3rem' }}>
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1rem',
                    color: getStatusColor(health?.status || 'error')
                }}>
                    {getStatusIcon(health?.status || 'error')}
                </div>
                <h2>System {health?.status === 'ok' ? 'Operational' : 'Has Issues'}</h2>
                <p style={{ color: '#888', marginTop: '0.5rem' }}>
                    Uptime: {health?.info?.uptime ? `${Math.floor(health.info.uptime / 60)} minutes` : 'Unknown'}
                </p>
            </div>

            {/* Services Grid */}
            <div className="admin-grid admin-grid-3">
                {/* Database */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <span className="admin-card-title">Database</span>
                        <span>{getStatusIcon(health?.info?.database?.status || 'down')}</span>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getStatusColor(health?.info?.database?.status || 'down') }}></div>
                            <span style={{ fontWeight: 600 }}>{health?.info?.database?.status?.toUpperCase() || 'DOWN'}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                            {health?.info?.database?.message || 'Prisma connection'}
                        </p>
                    </div>
                </div>

                {/* Redis / Cache */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <span className="admin-card-title">Redis / Queue</span>
                        <span>{getStatusIcon(health?.info?.redis?.status || 'unknown')}</span>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getStatusColor(health?.info?.redis?.status || 'unknown') }}></div>
                            <span style={{ fontWeight: 600 }}>{health?.info?.redis?.status?.toUpperCase() || 'UNKNOWN'}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                            {health?.info?.redis?.message || 'Cache & Job Queue'}
                        </p>
                    </div>
                </div>

                {/* Google Integration */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <span className="admin-card-title">Google APIs</span>
                        <span>{getStatusIcon(health?.info?.google?.status || 'unknown')}</span>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getStatusColor(health?.info?.google?.status || 'unknown') }}></div>
                            <span style={{ fontWeight: 600 }}>{health?.info?.google?.status?.toUpperCase() || 'UNKNOWN'}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                            {health?.info?.google?.message || 'API Connection'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Raw JSON for Debug */}
            <div style={{ marginTop: '2rem' }}>
                <details>
                    <summary style={{ cursor: 'pointer', color: '#666', marginBottom: '1rem' }}>View Raw JSON</summary>
                    <pre style={{ background: '#000', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', overflow: 'auto' }}>
                        {JSON.stringify(health, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    );
};

export default SystemHealthPage;
