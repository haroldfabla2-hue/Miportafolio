import React, { useState, useEffect } from 'react';
import { authFetch } from '../../services/api';

// Types
interface Client {
    id: string;
    name: string;
    company: string;
    email: string;
    status: string;
    _count?: {
        projects: number;
        invoices: number;
    };
    createdAt: string;
}

// Status colors
const statusColors: Record<string, { bg: string; text: string }> = {
    'ACTIVE': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' },
    'LEAD': { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
    'CHURNED': { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
};

// Client Row Component
const ClientRow: React.FC<{ client: Client; onEdit: (c: Client) => void }> = ({ client, onEdit }) => {
    const status = statusColors[client.status] || statusColors['LEAD'];

    return (
        <tr onClick={() => onEdit(client)} style={{ cursor: 'pointer' }}>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--color-accent), #6366f1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: '#000',
                        fontSize: '1rem'
                    }}>
                        {client.company.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{client.company}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{client.name}</div>
                    </div>
                </div>
            </td>
            <td style={{ color: '#888' }}>{client.email}</td>
            <td>
                <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: status.bg,
                    color: status.text
                }}>
                    {client.status}
                </span>
            </td>
            <td style={{ color: '#888' }}>{client._count?.projects || 0}</td>
            <td style={{ color: '#888' }}>{client._count?.invoices || 0}</td>
            <td style={{ color: '#666', fontSize: '0.85rem' }}>
                {new Date(client.createdAt).toLocaleDateString()}
            </td>
        </tr>
    );
};

// Create/Edit Modal
interface ClientModalProps {
    client: Partial<Client> | null;
    onClose: () => void;
    onSave: (data: Partial<Client>) => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ client, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: client?.name || '',
        company: client?.company || '',
        email: client?.email || '',
        status: client?.status || 'LEAD'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
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
                maxWidth: '500px',
                padding: '2rem'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>
                    {client?.id ? 'Edit Client' : 'New Client'}
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Company */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            required
                            placeholder="Acme Inc."
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'var(--admin-bg)',
                                border: '1px solid var(--admin-border-color)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Contact Name */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>
                            Contact Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="John Doe"
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'var(--admin-bg)',
                                border: '1px solid var(--admin-border-color)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="contact@company.com"
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'var(--admin-bg)',
                                border: '1px solid var(--admin-border-color)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Status */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'var(--admin-bg)',
                                border: '1px solid var(--admin-border-color)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        >
                            <option value="LEAD">Lead</option>
                            <option value="ACTIVE">Active</option>
                            <option value="CHURNED">Churned</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={onClose} className="admin-btn admin-btn-secondary" style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button type="submit" className="admin-btn admin-btn-primary" style={{ flex: 1 }}>
                            {client?.id ? 'Save Changes' : 'Add Client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Clients Page
const ClientsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await authFetch('/api/crm/clients');
            if (response.ok) {
                const data = await response.json();
                setClients(data);
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: Partial<Client>) => {
        try {
            const url = selectedClient?.id
                ? `/api/crm/clients/${selectedClient.id}`
                : '/api/crm/clients';
            const method = selectedClient?.id ? 'PUT' : 'POST';

            const response = await authFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                fetchClients();
                setModalOpen(false);
                setSelectedClient(null);
            }
        } catch (error) {
            console.error('Failed to save client:', error);
        }
    };

    const openModal = (client?: Client) => {
        setSelectedClient(client || null);
        setModalOpen(true);
    };

    // No demo data - use real data only
    const displayClients = clients;
    const filteredClients = displayClients.filter(c =>
        c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="admin-page-title">Clients</h1>
                    <p className="admin-page-subtitle">Manage your client relationships and portfolios.</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={() => openModal()}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Client
                </button>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
                <div className="admin-search" style={{ width: '100%' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <div className="admin-skeleton" style={{ width: '100%', height: '300px' }} />
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Projects</th>
                                <th>Invoices</th>
                                <th>Added</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map(client => (
                                <ClientRow key={client.id} client={client} onEdit={openModal} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <ClientModal
                    client={selectedClient}
                    onClose={() => { setModalOpen(false); setSelectedClient(null); }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default ClientsPage;
