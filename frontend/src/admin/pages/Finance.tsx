import React, { useState, useEffect } from 'react';
import { authFetch } from '../../services/api';
import EmptyState from '../components/EmptyState';

// Types aligning with Prisma Schema and Backend Response
interface Invoice {
    id: string;
    number: string; // Backend sends "number", we map it or use it directly
    client: { id: string; name: string; email: string };
    project?: { id: string; name: string };
    status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE';
    total: number;
    items: any; // JSON field
    createdAt: string;
    // Computed/Optional for UI compatibility if needed
    termDays?: number; // e.g., Net 30
}

interface Stats {
    totalRevenue: number;
    pendingRevenue: number;
    overdueAmount: number;
    invoiceCount: { total: number; paid: number; pending: number; overdue: number };
}

const statusColors: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: 'rgba(107, 114, 128, 0.15)', text: '#888' },
    PENDING: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
    PAID: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' },
    OVERDUE: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
};

// Helper: Calculate Due Date (Default Net 30 if not present)
const getDueDate = (createdAt: string, termDays = 30) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + termDays);
    return date.toLocaleDateString();
};

// Invoice Row
const InvoiceRow: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
    const status = statusColors[invoice.status] || statusColors['DRAFT'];

    return (
        <tr>
            <td style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{invoice.number}</td>
            <td>
                <div>
                    <div style={{ fontWeight: 500, color: '#fff' }}>{invoice.client?.name || 'Unknown Client'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{invoice.client?.email}</div>
                </div>
            </td>
            <td style={{ color: '#888' }}>{invoice.project?.name || '-'}</td>
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
                    {invoice.status}
                </span>
            </td>
            <td style={{ fontWeight: 600, color: '#fff' }}>${invoice.total.toLocaleString()}</td>
            <td style={{ color: '#666', fontSize: '0.85rem' }}>
                {getDueDate(invoice.createdAt)}
            </td>
            <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="admin-btn admin-btn-ghost" style={{ padding: '0.35rem' }} title="Download PDF">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </button>
                    {/* Placeholder for Edit/View actions */}
                </div>
            </td>
        </tr>
    );
};

// Main Finance Page
const FinancePage: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invoicesRes, statsRes] = await Promise.all([
                authFetch('/api/finance/invoices'),
                authFetch('/api/finance'),
            ]);

            if (invoicesRes.ok) {
                const data = await invoicesRes.json();
                setInvoices(data);
            }
            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const emptyStats: Stats = {
        totalRevenue: 0,
        pendingRevenue: 0,
        overdueAmount: 0,
        invoiceCount: { total: 0, paid: 0, pending: 0, overdue: 0 },
    };

    const displayStats = stats || emptyStats;
    const filteredInvoices = filter === 'all'
        ? invoices
        : invoices.filter(i => i.status.toLowerCase() === filter);

    return (
        <div>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="admin-page-title">Finance</h1>
                    <p className="admin-page-subtitle">Invoices, payments, and financial analytics.</p>
                </div>
                <button className="admin-btn admin-btn-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Invoice
                </button>
            </div>

            {/* Stats */}
            <div className="admin-grid admin-grid-4" style={{ marginBottom: '2rem' }}>
                <div className="admin-card">
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Total Revenue</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-accent)' }}>${displayStats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="admin-card">
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Pending</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b' }}>${displayStats.pendingRevenue.toLocaleString()}</p>
                </div>
                <div className="admin-card">
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Overdue</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ef4444' }}>${displayStats.overdueAmount.toLocaleString()}</p>
                </div>
                <div className="admin-card">
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Total Invoices</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>{displayStats.invoiceCount.total}</p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {(['all', 'pending', 'paid', 'overdue'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`admin-btn ${filter === f ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${displayStats.invoiceCount[f]})`}
                    </button>
                ))}
            </div>

            {/* Invoices Table */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Invoice #</th>
                            <th>Client</th>
                            <th>Project</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Due Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                        ) : filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: 0 }}>
                                    <div style={{ padding: '2rem' }}>
                                        <EmptyState
                                            type="finance"
                                            title={invoices.length === 0 ? "No Invoices Issued" : "No Invoices Found"}
                                            description={invoices.length === 0
                                                ? "Create your first invoice to start getting paid. Track payments and manage finance."
                                                : `No invoices match the status "${filter}".`}
                                            actionLabel={invoices.length === 0 ? "New Invoice" : undefined}
                                            onAction={invoices.length === 0 ? () => { } : undefined}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map(invoice => (
                                <InvoiceRow key={invoice.id} invoice={invoice} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinancePage;
