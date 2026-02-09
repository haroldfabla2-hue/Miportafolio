import React from 'react';

interface Invoice {
    id: string;
    number: string;
    date: string;
    amount: number;
    status: 'PAID' | 'PENDING' | 'OVERDUE' | 'DRAFT';
}

interface ProjectFinanceProps {
    budget: number;
    spent: number;
    invoices: Invoice[];
}

const ProjectFinance: React.FC<ProjectFinanceProps> = ({ budget = 0, spent = 0, invoices = [] }) => {
    const remaining = budget - spent;
    const progress = budget > 0 ? (spent / budget) * 100 : 0;

    const statusColors: Record<string, string> = {
        'PAID': '#22c55e',
        'PENDING': '#f59e0b',
        'OVERDUE': '#ef4444',
        'DRAFT': '#888'
    };

    return (
        <div>
            {/* Budget Overview */}
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2rem' }}>
                <div className="admin-card">
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>Total Budget</span>
                    <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0', color: '#fff' }}>${budget.toLocaleString()}</h3>
                </div>
                <div className="admin-card">
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>Spent</span>
                    <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0', color: '#a3ff00' }}>${spent.toLocaleString()}</h3>
                </div>
                <div className="admin-card">
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>Remaining</span>
                    <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0', color: remaining < 0 ? '#ef4444' : '#fff' }}>${remaining.toLocaleString()}</h3>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="admin-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>Budget Utilization</span>
                    <span>{progress.toFixed(1)}%</span>
                </div>
                <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${Math.min(progress, 100)}%`,
                        background: progress > 100 ? '#ef4444' : '#a3ff00',
                        borderRadius: '5px'
                    }} />
                </div>
            </div>

            {/* Invoices List */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <h3>Project Invoices</h3>
                <button className="admin-btn admin-btn-secondary">+ Create Invoice</button>
            </div>

            {invoices.length === 0 ? (
                <div className="admin-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: '#888' }}>No invoices created for this project yet.</p>
                </div>
            ) : (
                <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>Invoice #</th>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Amount</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(inv => (
                                <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500, color: '#fff' }}>{inv.number}</td>
                                    <td style={{ padding: '1rem', color: '#aaa' }}>{new Date(inv.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>${inv.amount.toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: `${statusColors[inv.status]}20`, // 20% opacity
                                            color: statusColors[inv.status]
                                        }}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProjectFinance;
