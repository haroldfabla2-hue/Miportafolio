import React, { useState, useEffect } from 'react';
import { authFetch } from '../../services/api';

// Types
interface Ticket {
    id: string;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    category?: string;
    createdBy: { id: string; name: string; email: string; avatar: string | null };
    assignedTo?: { id: string; name: string; avatar: string | null };
    createdAt: string;
    resolvedAt?: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
    OPEN: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
    IN_PROGRESS: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
    RESOLVED: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' },
    CLOSED: { bg: 'rgba(107, 114, 128, 0.15)', text: '#888' },
};

const priorityColors: Record<string, { bg: string; text: string }> = {
    LOW: { bg: 'rgba(107, 114, 128, 0.15)', text: '#888' },
    MEDIUM: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
    HIGH: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
    CRITICAL: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
};

// Ticket Card
const TicketCard: React.FC<{ ticket: Ticket; onUpdateStatus: (id: string, status: string) => void }> = ({ ticket, onUpdateStatus }) => (
    <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', backgroundColor: statusColors[ticket.status].bg, color: statusColors[ticket.status].text }}>
                    {ticket.status.replace('_', ' ')}
                </span>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', backgroundColor: priorityColors[ticket.priority].bg, color: priorityColors[ticket.priority].text }}>
                    {ticket.priority}
                </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#666' }}>
                {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
            {ticket.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.5, marginBottom: '1rem' }}>
            {ticket.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--admin-border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img
                    src={ticket.createdBy.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.createdBy.email}`}
                    alt={ticket.createdBy.name}
                    style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                />
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{ticket.createdBy.name}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {ticket.status === 'OPEN' && (
                    <button onClick={() => onUpdateStatus(ticket.id, 'IN_PROGRESS')} className="admin-btn admin-btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                        Start
                    </button>
                )}
                {ticket.status === 'IN_PROGRESS' && (
                    <button onClick={() => onUpdateStatus(ticket.id, 'RESOLVED')} className="admin-btn admin-btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                        Resolve
                    </button>
                )}
            </div>
        </div>
    </div>
);

// Create Ticket Modal
const CreateTicketModal: React.FC<{ onClose: () => void; onCreate: (data: any) => void }> = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState({ title: '', description: '', priority: 'MEDIUM', category: '' });

    const handleSubmit = () => {
        onCreate(formData);
        onClose();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border-color)', borderRadius: '20px', width: '100%', maxWidth: '500px' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--admin-border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Create Ticket</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>Title</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            style={{ width: '100%', padding: '0.875rem', background: 'var(--admin-bg)', border: '1px solid var(--admin-border-color)', borderRadius: '10px', color: '#fff' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4}
                            style={{ width: '100%', padding: '0.875rem', background: 'var(--admin-bg)', border: '1px solid var(--admin-border-color)', borderRadius: '10px', color: '#fff', resize: 'none' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                style={{ width: '100%', padding: '0.875rem', background: 'var(--admin-bg)', border: '1px solid var(--admin-border-color)', borderRadius: '10px', color: '#fff' }}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>Category</label>
                            <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Bug, Feature, etc."
                                style={{ width: '100%', padding: '0.875rem', background: 'var(--admin-bg)', border: '1px solid var(--admin-border-color)', borderRadius: '10px', color: '#fff' }} />
                        </div>
                    </div>
                </div>
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--admin-border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button onClick={onClose} className="admin-btn admin-btn-secondary">Cancel</button>
                    <button onClick={handleSubmit} className="admin-btn admin-btn-primary">Create</button>
                </div>
            </div>
        </div>
    );
};

// Main Tickets Page
const TicketsPage: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
    const [stats, setStats] = useState({ total: 0, byStatus: { open: 0, inProgress: 0, resolved: 0 } });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const [ticketsRes, statsRes] = await Promise.all([
                authFetch('/api/tickets'),
                authFetch('/api/tickets/stats'),
            ]);
            if (ticketsRes.ok) setTickets(await ticketsRes.json());
            if (statsRes.ok) setStats(await statsRes.json());
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await fetch(`/api/tickets/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            fetchTickets();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const createTicket = async (data: any) => {
        try {
            await authFetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            fetchTickets();
        } catch (error) {
            console.error('Failed to create ticket:', error);
        }
    };

    // Demo data
    const demoTickets: Ticket[] = [
        { id: '1', title: 'Login button not responding on mobile', description: 'The login button on the mobile version of the site does not respond to taps. Tested on iPhone 14 and Samsung Galaxy S23.', status: 'OPEN', priority: 'HIGH', category: 'Bug', createdBy: { id: 'u1', name: 'Ana García', email: 'ana@example.com', avatar: null }, createdAt: '2024-01-17T10:00:00Z' },
        { id: '2', title: 'Feature request: Dark mode toggle', description: 'It would be great to have a dark mode toggle in the settings for users who prefer the dark theme.', status: 'IN_PROGRESS', priority: 'MEDIUM', category: 'Feature', createdBy: { id: 'u2', name: 'Luis Torres', email: 'luis@example.com', avatar: null }, assignedTo: { id: 'u3', name: 'Carlos Smith', avatar: null }, createdAt: '2024-01-15T14:30:00Z' },
        { id: '3', title: 'Dashboard loading slowly', description: 'The dashboard takes more than 5 seconds to load. This started happening after the last update.', status: 'RESOLVED', priority: 'HIGH', category: 'Performance', createdBy: { id: 'u4', name: 'María López', email: 'maria@example.com', avatar: null }, resolvedAt: '2024-01-16T11:00:00Z', createdAt: '2024-01-14T09:00:00Z' },
        { id: '4', title: 'Add export to CSV functionality', description: 'Need the ability to export reports and data tables to CSV format for further analysis.', status: 'OPEN', priority: 'LOW', category: 'Feature', createdBy: { id: 'u5', name: 'Pedro Sánchez', email: 'pedro@example.com', avatar: null }, createdAt: '2024-01-13T16:45:00Z' },
    ];

    const demoStats = { total: 4, byStatus: { open: 2, inProgress: 1, resolved: 1 } };

    const displayTickets = tickets.length > 0 ? tickets : demoTickets;
    const displayStats = stats.total > 0 ? stats : demoStats;
    const filteredTickets = filter === 'all' ? displayTickets : displayTickets.filter(t => t.status.toLowerCase().replace('_', '_') === filter.replace('_', '_'));

    return (
        <div>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="admin-page-title">Support Tickets</h1>
                    <p className="admin-page-subtitle">Track and resolve support requests.</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={() => setShowModal(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Ticket
                </button>
            </div>

            {/* Stats */}
            <div className="admin-grid admin-grid-4" style={{ marginBottom: '2rem' }}>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Total</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{displayStats.total}</p>
                </div>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Open</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{displayStats.byStatus.open}</p>
                </div>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>In Progress</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{displayStats.byStatus.inProgress}</p>
                </div>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Resolved</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{displayStats.byStatus.resolved}</p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`admin-btn ${filter === f ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                        {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tickets List */}
            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading...</div>
            ) : (
                <div className="admin-grid admin-grid-2">
                    {filteredTickets.map(ticket => (
                        <TicketCard key={ticket.id} ticket={ticket} onUpdateStatus={updateStatus} />
                    ))}
                </div>
            )}

            {showModal && <CreateTicketModal onClose={() => setShowModal(false)} onCreate={createTicket} />}
        </div>
    );
};

export default TicketsPage;
