import React, { useState, useEffect } from 'react';

interface AssignClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (clientId: string) => void;
    emailId: string; // To potentially link specifically to this email, or just return client ID
}

interface Client {
    id: string;
    name: string;
    company: string;
    email: string;
}

const AssignClientModal: React.FC<AssignClientModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchClients();
        }
    }, [isOpen]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/crm/clients');
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (error) {
            console.error('Failed to fetch clients', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.company?.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: '#1a1a1a', padding: '2rem', borderRadius: '12px', width: '500px', maxHeight: '80vh',
                border: '1px solid #333', color: '#fff', display: 'flex', flexDirection: 'column'
            }}>
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Assign Client</h2>

                <input
                    type="text"
                    placeholder="Search clients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: '100%', padding: '0.75rem', background: '#222', border: '1px solid #333',
                        borderRadius: '6px', color: '#fff', outline: 'none', marginBottom: '1rem'
                    }}
                />

                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', minHeight: '200px' }}>
                    {loading ? (
                        <div style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Loading...</div>
                    ) : filteredClients.length === 0 ? (
                        <div style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No clients found.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {filteredClients.map(client => (
                                <div
                                    key={client.id}
                                    onClick={() => onSuccess(client.id)}
                                    style={{
                                        padding: '1rem', background: '#222', borderRadius: '8px', cursor: 'pointer',
                                        border: '1px solid transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#a3ff00'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{client.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{client.company} • {client.email}</div>
                                    </div>
                                    <div style={{ color: '#a3ff00' }}>Selector</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #333',
                            borderRadius: '6px', color: '#fff', cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignClientModal;
