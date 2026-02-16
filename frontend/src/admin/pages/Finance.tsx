import React, { useState, useEffect } from 'react';
import { api, financeApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, FileText, Download, Filter, Plus, TrendingUp, AlertCircle, CheckCircle2, Clock, MoreVertical, Search, ExternalLink } from 'lucide-react';
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
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group hover:bg-white/[0.02] transition-all border-b border-white/5"
        >
            <td className="py-4 px-6">
                <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{invoice.number}</span>
            </td>
            <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 border border-white/5">
                        {invoice.client?.name.charAt(0)}
                    </div>
                    <div>
                        <div className="text-xs font-black text-white uppercase">{invoice.client?.name || 'Unknown Client'}</div>
                        <div className="text-[10px] font-bold text-slate-500">{invoice.client?.email}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-6">
                <span className="text-xs font-bold text-slate-400">{invoice.project?.name || '-'}</span>
            </td>
            <td className="py-4 px-6">
                <span style={{ backgroundColor: status.bg, color: status.text }} className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase border border-white/5">
                    {invoice.status}
                </span>
            </td>
            <td className="py-4 px-6">
                <span className="text-sm font-black text-white">${invoice.total.toLocaleString()}</span>
            </td>
            <td className="py-4 px-6">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase">
                    <Clock size={12} />
                    {getDueDate(invoice.createdAt)}
                </div>
            </td>
            <td className="py-4 px-6">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-brand-500 transition-all">
                        <Download size={14} />
                    </button>
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all">
                        <ExternalLink size={14} />
                    </button>
                </div>
            </td>
        </motion.tr>
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
        setLoading(true);
        try {
            const [invoicesRes, statsRes] = await Promise.all([
                api.get('/finance/invoices'),
                financeApi.getStats(),
            ]);

            setInvoices(invoicesRes.data);
            setStats(statsRes);
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

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-brand-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={48} />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Revenue</p>
                    <p className="text-3xl font-black text-white">${displayStats.totalRevenue.toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-brand-500 uppercase">Live Metrics</span>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock size={48} />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pending Balance</p>
                    <p className="text-3xl font-black text-amber-500">${displayStats.pendingRevenue.toLocaleString()}</p>
                    <p className="mt-4 text-[10px] font-bold text-slate-500 uppercase">{displayStats.invoiceCount.pending} Invoices awaiting payment</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-rose-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertCircle size={48} />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Overdue Amount</p>
                    <p className="text-3xl font-black text-rose-500">${displayStats.overdueAmount.toLocaleString()}</p>
                    <p className="mt-4 text-[10px] font-bold text-rose-500 uppercase tracking-tighter shadow-rose-500/20">{displayStats.invoiceCount.overdue} Critical overdue items</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-brand-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FileText size={48} />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Issued</p>
                    <p className="text-3xl font-black text-white">{displayStats.invoiceCount.total}</p>
                    <p className="mt-4 text-[10px] font-bold text-slate-500 uppercase">Cumulative invoice count</p>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto">
                    {(['all', 'pending', 'paid', 'overdue'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-brand-600 text-black shadow-lg shadow-brand-500/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {f} {f !== 'all' && <span className="ml-1 opacity-50">({displayStats.invoiceCount[f]})</span>}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                        type="text"
                        placeholder="SEARCH INVOICE #"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] font-black text-white uppercase outline-none focus:border-brand-500 transition-all"
                    />
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Number</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Project</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Due Date</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Analyzing Financial Records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        <div className="py-20">
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
                                <AnimatePresence mode="popLayout">
                                    {filteredInvoices.map(invoice => (
                                        <InvoiceRow key={invoice.id} invoice={invoice} />
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinancePage;
