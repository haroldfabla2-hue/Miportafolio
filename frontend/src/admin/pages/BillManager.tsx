import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface Supplier {
    id: string;
    name: string;
    email?: string;
    taxId?: string;
    currency: string;
}

interface Bill {
    id: string;
    number: string;
    supplierId: string;
    supplier?: Supplier;
    status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE';
    amount: number;
    dueDate: string;
    createdAt: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: 'rgba(107, 114, 128, 0.15)', text: '#888' },
    PENDING: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
    PAID: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' },
    OVERDUE: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
};

const BillManager: React.FC = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'bills' | 'suppliers'>('bills');

    // Form state
    const [form, setForm] = useState({
        number: '',
        supplierId: '',
        amount: '',
        dueDate: '',
        status: 'PENDING',
    });

    const [supplierForm, setSupplierForm] = useState({
        name: '',
        email: '',
        taxId: '',
        currency: 'USD',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [billsRes, suppliersRes] = await Promise.all([
                api.get('/finance/bills'),
                api.get('/finance/suppliers'),
            ]);
            setBills(billsRes.data || []);
            setSuppliers(suppliersRes.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBill = async () => {
        try {
            await api.post('/finance/bills', {
                number: form.number,
                supplierId: form.supplierId,
                amount: parseFloat(form.amount),
                dueDate: form.dueDate,
                status: form.status,
            });
            setShowModal(false);
            setForm({ number: '', supplierId: '', amount: '', dueDate: '', status: 'PENDING' });
            fetchData();
        } catch (error) {
            console.error('Failed to create bill:', error);
        }
    };

    const handleCreateSupplier = async () => {
        try {
            await api.post('/finance/suppliers', supplierForm);
            setSupplierForm({ name: '', email: '', taxId: '', currency: 'USD' });
            fetchData();
        } catch (error) {
            console.error('Failed to create supplier:', error);
        }
    };

    const handleUpdateBillStatus = async (id: string, status: string) => {
        try {
            await api.put(`/finance/bills/${id}`, { status });
            fetchData();
        } catch (error) {
            console.error('Failed to update bill:', error);
        }
    };

    const totalPending = bills.filter(b => b.status === 'PENDING' || b.status === 'OVERDUE').reduce((sum, b) => sum + b.amount, 0);
    const totalPaid = bills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + b.amount, 0);

    return (
        <div>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="admin-page-title">Bills & Expenses</h1>
                    <p className="admin-page-subtitle">Manage supplier invoices and track expenses.</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={() => setShowModal(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Bill
                </button>
            </div>

            {/* Stats */}
            <div className="admin-grid admin-grid-3" style={{ marginBottom: '2rem' }}>
                <div className="admin-card">
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Total Paid</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>${totalPaid.toLocaleString()}</p>
                </div>
                <div className="admin-card">
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Pending/Overdue</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b' }}>${totalPending.toLocaleString()}</p>
                </div>
                <div className="admin-card">
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Suppliers</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>{suppliers.length}</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setActiveTab('bills')}
                    className={`admin-btn ${activeTab === 'bills' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                >
                    Bills ({bills.length})
                </button>
                <button
                    onClick={() => setActiveTab('suppliers')}
                    className={`admin-btn ${activeTab === 'suppliers' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                >
                    Suppliers ({suppliers.length})
                </button>
            </div>

            {/* Bills Table */}
            {activeTab === 'bills' && (
                <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Bill #</th>
                                <th>Supplier</th>
                                <th>Status</th>
                                <th>Amount</th>
                                <th>Due Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : bills.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No bills yet</td></tr>
                            ) : (
                                bills.map(bill => (
                                    <tr key={bill.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{bill.number}</td>
                                        <td>{bill.supplier?.name || 'Unknown'}</td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                backgroundColor: statusColors[bill.status]?.bg || statusColors.PENDING.bg,
                                                color: statusColors[bill.status]?.text || statusColors.PENDING.text
                                            }}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>${bill.amount.toLocaleString()}</td>
                                        <td style={{ color: '#666' }}>{new Date(bill.dueDate).toLocaleDateString()}</td>
                                        <td>
                                            {bill.status !== 'PAID' && (
                                                <button
                                                    className="admin-btn admin-btn-ghost"
                                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                                    onClick={() => handleUpdateBillStatus(bill.id, 'PAID')}
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Suppliers Table */}
            {activeTab === 'suppliers' && (
                <div className="admin-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            placeholder="Supplier Name"
                            value={supplierForm.name}
                            onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
                            className="admin-input"
                            style={{ flex: 1 }}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={supplierForm.email}
                            onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })}
                            className="admin-input"
                            style={{ flex: 1 }}
                        />
                        <button className="admin-btn admin-btn-primary" onClick={handleCreateSupplier}>
                            Add Supplier
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                        {suppliers.map(supplier => (
                            <div key={supplier.id} className="admin-card" style={{ backgroundColor: '#1a1a1a' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{supplier.name}</h3>
                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#666' }}>{supplier.email || 'No email'}</p>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#444' }}>Currency: {supplier.currency}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* New Bill Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="admin-card" style={{ width: '400px', padding: '2rem' }}>
                        <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem' }}>New Bill</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Bill Number (e.g., BILL-001)"
                                value={form.number}
                                onChange={e => setForm({ ...form, number: e.target.value })}
                                className="admin-input"
                            />
                            <select
                                value={form.supplierId}
                                onChange={e => setForm({ ...form, supplierId: e.target.value })}
                                className="admin-input"
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Amount"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                className="admin-input"
                            />
                            <input
                                type="date"
                                placeholder="Due Date"
                                value={form.dueDate}
                                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                                className="admin-input"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                            <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="admin-btn admin-btn-primary" onClick={handleCreateBill}>Create Bill</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillManager;
