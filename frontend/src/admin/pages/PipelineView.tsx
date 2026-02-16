import React, { useState, useEffect } from 'react';
import { leadsApi } from '../../services/api';
import type { Lead, LeadStatus } from '../../types/models';
import {
    Plus, X, Mail, Building2,
    Trash2, Edit2, UserPlus, Search, Loader2
} from 'lucide-react';

const STAGES: { id: LeadStatus; label: string; color: string }[] = [
    { id: 'NEW', label: 'New', color: 'bg-slate-500' },
    { id: 'CONTACTED', label: 'Contacted', color: 'bg-blue-500' },
    { id: 'QUALIFIED', label: 'Qualified', color: 'bg-purple-500' },
    { id: 'PROPOSAL', label: 'Proposal', color: 'bg-amber-500' },
    { id: 'NEGOTIATION', label: 'Negotiation', color: 'bg-orange-500' },
    { id: 'WON', label: 'Won', color: 'bg-emerald-500' },
    { id: 'LOST', label: 'Lost', color: 'bg-red-500' }
];

export const PipelineView: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [leadsData, statsData] = await Promise.all([
                leadsApi.getAll(),
                leadsApi.getStats()
            ]);
            setLeads(leadsData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load pipeline data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, lead: Lead) => {
        setDraggedLead(lead);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, newStage: string) => {
        e.preventDefault();
        if (!draggedLead || draggedLead.status === newStage) return;

        // Optimistic update
        const originalLeads = [...leads];
        setLeads(prev => prev.map(l => l.id === draggedLead.id ? { ...l, status: newStage as LeadStatus } : l));

        try {
            await leadsApi.updateStatus(draggedLead.id, newStage);
            loadData(); // Refresh to ensure sync
        } catch (error) {
            console.error('Failed to update lead stage:', error);
            setLeads(originalLeads); // Revert on error
        }
        setDraggedLead(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this lead?')) return;
        try {
            await leadsApi.delete(id);
            setLeads(prev => prev.filter(l => l.id !== id));
            loadData();
        } catch (error) {
            console.error('Failed to delete lead:', error);
        }
    };

    const handleConvert = async (lead: Lead) => {
        if (!confirm(`Convert ${lead.name} to a client? This will create a new client and mark the lead as WON.`)) return;
        try {
            await leadsApi.convert(lead);
            loadData();
            alert('Lead converted successfully!');
        } catch (error) {
            console.error('Failed to convert lead:', error);
            alert('Failed to convert lead.');
        }
    };

    const filteredLeads = leads.filter(lead =>
        searchTerm === '' ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getLeadsByStage = (stage: string) =>
        filteredLeads.filter(l => l.status === stage);

    const activeValue = typeof stats.totalValue === 'number' ? stats.totalValue : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Sales Pipeline</h1>
                    <p className="text-slate-500">Manage your leads and deals</p>
                </div>
                <button
                    onClick={() => { setEditingLead(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition font-medium"
                >
                    <Plus size={18} /> New Lead
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Leads" value={leads.length} />
                <StatCard label="Pipeline Value" value={`$${activeValue.toLocaleString()}`} color="text-indigo-600" />
                <StatCard label="Won Deals" value={stats.won || 0} color="text-emerald-600" />
                <StatCard label="Conversion Rate" value={`${leads.length > 0 ? Math.round(((stats.won || 0) / leads.length) * 100) : 0}%`} color="text-purple-600" />
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search leads by name, email, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
            </div>

            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-4 flex-1 custom-scroll">
                {STAGES.map(stage => (
                    <div
                        key={stage.id}
                        className="flex-shrink-0 w-80 bg-slate-50/50 rounded-xl border border-slate-200/60 flex flex-col max-h-full"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                    >
                        {/* Column Header */}
                        <div className="p-3 border-b border-slate-200/60 flex items-center justify-between sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 rounded-t-xl">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                                <span className="font-bold text-slate-700 text-sm">{stage.label}</span>
                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                                    {getLeadsByStage(stage.id).length}
                                </span>
                            </div>
                        </div>

                        {/* Cards Container */}
                        <div className="p-2 space-y-2 overflow-y-auto flex-1 custom-scroll min-h-[150px]">
                            {getLeadsByStage(stage.id).map(lead => (
                                <div
                                    key={lead.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, lead)}
                                    className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition group relative"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-slate-800 truncate pr-6" title={lead.name}>{lead.name}</h4>
                                        <div className="xl:opacity-0 group-hover:opacity-100 flex gap-1 absolute top-2 right-2 transition-opacity bg-white/80 p-0.5 rounded backdrop-blur-sm">
                                            <button
                                                onClick={() => { setEditingLead(lead); setShowModal(true); }}
                                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-500"
                                                title="Edit"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(lead.id)}
                                                className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"
                                                title="Delete"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    {lead.company && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                                            <Building2 size={12} /> {lead.company}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                                        <Mail size={12} /> <span className="truncate">{lead.email}</span>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                        <span className="text-sm font-bold text-slate-700">
                                            ${lead.value?.toLocaleString() || 0}
                                        </span>
                                        {stage.id === 'NEGOTIATION' && (
                                            <button
                                                onClick={() => handleConvert(lead)}
                                                className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-emerald-200 font-medium transition"
                                            >
                                                <UserPlus size={10} /> Convert
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lead Modal */}
            {showModal && (
                <LeadModal
                    lead={editingLead}
                    onClose={() => setShowModal(false)}
                    onSave={async (data) => {
                        try {
                            if (editingLead) {
                                await leadsApi.update(editingLead.id, data);
                            } else {
                                await leadsApi.create(data);
                            }
                            setShowModal(false);
                            loadData();
                        } catch (error) {
                            console.error('Failed to save lead:', error);
                            alert('Failed to save lead.');
                        }
                    }}
                />
            )}
        </div>
    );
};

// Stat Card Component
const StatCard = ({ label, value, color = 'text-slate-800' }: { label: string, value: string | number, color?: string }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

// Lead Create/Edit Modal
const LeadModal = ({ lead, onClose, onSave }: { lead: Lead | null; onClose: () => void; onSave: (data: any) => void }) => {
    const [formData, setFormData] = useState({
        name: lead?.name || '',
        email: lead?.email || '',
        phone: lead?.phone || '',
        company: lead?.company || '',
        source: lead?.source || '',
        value: lead?.value || 0,
        notes: lead?.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-slate-800">
                        {lead ? 'Edit Lead' : 'New Lead'}
                    </h2>
                    <button onClick={onClose} className="hover:bg-slate-200 p-1 rounded-full"><X size={20} className="text-slate-500" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name *</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                            <input
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company</label>
                            <input
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Source</label>
                            <select
                                value={formData.source}
                                onChange={e => setFormData({ ...formData, source: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">Select...</option>
                                <option value="Website">Website</option>
                                <option value="Referral">Referral</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Cold Call">Cold Call</option>
                                <option value="Event">Event</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deal Value ($)</label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm">
                            {lead ? 'Save Changes' : 'Create Lead'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PipelineView;
