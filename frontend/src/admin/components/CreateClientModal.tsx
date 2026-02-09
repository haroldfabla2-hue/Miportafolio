import React, { useState } from 'react';

interface CreateClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (client: any) => void;
    initialData?: {
        name: string;
        email: string;
        company?: string;
    };
}

const CreateClientModal: React.FC<CreateClientModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        company: initialData?.company || '',
        status: 'LEAD', // Default status
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/crm/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create client');
            }

            const newClient = await response.json();
            onSuccess(newClient);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error creating client');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: '#1a1a1a', padding: '2rem', borderRadius: '12px', width: '400px',
                border: '1px solid #333', color: '#fff'
            }}>
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Create Client</h2>

                {error && <div style={{ color: '#ff4444', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255, 68, 68, 0.1)', borderRadius: '4px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            style={{
                                width: '100%', padding: '0.75rem', background: '#222', border: '1px solid #333',
                                borderRadius: '6px', color: '#fff', outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            style={{
                                width: '100%', padding: '0.75rem', background: '#222', border: '1px solid #333',
                                borderRadius: '6px', color: '#fff', outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Company</label>
                        <input
                            type="text"
                            value={formData.company}
                            onChange={e => setFormData({ ...formData, company: e.target.value })}
                            style={{
                                width: '100%', padding: '0.75rem', background: '#222', border: '1px solid #333',
                                borderRadius: '6px', color: '#fff', outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Status</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            style={{
                                width: '100%', padding: '0.75rem', background: '#222', border: '1px solid #333',
                                borderRadius: '6px', color: '#fff', outline: 'none'
                            }}
                        >
                            <option value="LEAD">Lead</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #333',
                                borderRadius: '6px', color: '#fff', cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.75rem 1.5rem', background: '#a3ff00', border: 'none',
                                borderRadius: '6px', color: '#000', fontWeight: 600, cursor: loading ? 'wait' : 'pointer'
                            }}
                        >
                            {loading ? 'Creating...' : 'Create Client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateClientModal;
