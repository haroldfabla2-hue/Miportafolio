import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface Client {
    id: string;
    name: string;
    company?: string;
    email: string;
}

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

const InvoiceDesigner: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);

    const [invoice, setInvoice] = useState({
        clientId: '',
        number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
        status: 'DRAFT',
        dueDate: '',
    });

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', description: '', quantity: 1, unitPrice: 0 }
    ]);

    const taxRate = 18; // Default IGV / Tax rate
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await api.get('/crm/clients');
            setClients(res.data || []);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    };

    const addItem = () => {
        setItems([...items, {
            id: String(Date.now()),
            description: '',
            quantity: 1,
            unitPrice: 0
        }]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSave = async (status: 'DRAFT' | 'PENDING') => {
        if (!invoice.clientId) {
            alert('Please select a client');
            return;
        }

        setLoading(true);
        try {
            await api.post('/finance/invoices', {
                number: invoice.number,
                clientId: invoice.clientId,
                status,
                items: items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    price: item.unitPrice,
                    total: item.quantity * item.unitPrice,
                })),
                total,
            });
            alert(`Invoice ${status === 'DRAFT' ? 'saved as draft' : 'created'} successfully!`);
            // Reset form
            setInvoice({
                clientId: '',
                number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
                status: 'DRAFT',
                dueDate: '',
            });
            setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);
        } catch (error) {
            console.error('Failed to create invoice:', error);
            alert('Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="admin-page-title">Invoice Designer</h1>
                    <p className="admin-page-subtitle">Create and customize client invoices.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => handleSave('DRAFT')}
                        disabled={loading}
                    >
                        Save Draft
                    </button>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => handleSave('PENDING')}
                        disabled={loading}
                    >
                        Create Invoice
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* Invoice Form */}
                <div className="admin-card" style={{ padding: '2rem' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #333' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-accent)' }}>INVOICE</h2>
                            <input
                                type="text"
                                value={invoice.number}
                                onChange={e => setInvoice({ ...invoice, number: e.target.value })}
                                className="admin-input"
                                style={{ marginTop: '0.5rem', fontFamily: 'monospace', width: '200px' }}
                            />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>Iris CRM</p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666' }}>Your Business Address</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>billing@example.com</p>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.85rem' }}>Bill To:</label>
                        <select
                            value={invoice.clientId}
                            onChange={e => setInvoice({ ...invoice, clientId: e.target.value })}
                            className="admin-input"
                            style={{ width: '100%', maxWidth: '300px' }}
                        >
                            <option value="">Select Client</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.company || client.name} ({client.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Items Table */}
                    <table className="admin-table" style={{ marginBottom: '1.5rem' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '50%' }}>Description</th>
                                <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
                                <th style={{ width: '20%', textAlign: 'right' }}>Price</th>
                                <th style={{ width: '15%', textAlign: 'right' }}>Total</th>
                                <th style={{ width: '40px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <input
                                            type="text"
                                            placeholder="Item description..."
                                            value={item.description}
                                            onChange={e => updateItem(item.id, 'description', e.target.value)}
                                            className="admin-input"
                                            style={{ width: '100%', background: 'transparent', border: 'none', padding: 0 }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                            className="admin-input"
                                            style={{ width: '60px', textAlign: 'center', background: '#1a1a1a' }}
                                            min={1}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <input
                                            type="number"
                                            value={item.unitPrice}
                                            onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            className="admin-input"
                                            style={{ width: '100px', textAlign: 'right', background: '#1a1a1a' }}
                                            min={0}
                                            step={0.01}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                        ${(item.quantity * item.unitPrice).toFixed(2)}
                                    </td>
                                    <td>
                                        <button
                                            className="admin-btn admin-btn-ghost"
                                            onClick={() => removeItem(item.id)}
                                            style={{ padding: '0.25rem', color: '#ef4444' }}
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button className="admin-btn admin-btn-secondary" onClick={addItem}>
                        + Add Item
                    </button>
                </div>

                {/* Summary Sidebar */}
                <div className="admin-card" style={{ padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '1rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: '#888' }}>Invoice Summary</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#888' }}>Subtotal</span>
                            <span style={{ fontWeight: 500 }}>${subtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#888' }}>Tax ({taxRate}%)</span>
                            <span style={{ fontWeight: 500 }}>${taxAmount.toFixed(2)}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: '0.75rem',
                            marginTop: '0.5rem',
                            borderTop: '2px solid #333'
                        }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total</span>
                            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-accent)' }}>
                                ${total.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: '#1a1a1a', borderRadius: '8px', fontSize: '0.85rem', color: '#666' }}>
                        <strong style={{ color: '#888' }}>Note:</strong> After creating the invoice, you can download it as PDF from the Finance page.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDesigner;
