import React, { useState, useEffect } from 'react';
import { leadsApi } from '../../services/api';
import type { Lead, LeadStatus } from '../../types/models';
import { Edit2, Plus, Search, Trash2, ArrowRight, TrendingUp, Filter, Loader2, Download, Building2, Mail, Sparkles, UserPlus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DangerConfirmModal } from '../components/ui/DangerConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { t } = useTranslation();

    // Confirm Modal states
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: (() => void) | null;
        requireType?: string;
    }>({ isOpen: false, title: '', message: '', action: null });
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

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: t('pipeline.deleteTitle', 'Delete Lead'),
            message: t('pipeline.deleteMessage', 'Are you sure you want to delete this lead? This action cannot be undone.'),
            requireType: 'ELIMINAR',
            action: async () => {
                try {
                    await leadsApi.delete(id);
                    setLeads(prev => prev.filter(l => l.id !== id));
                    loadData();
                    toast.success(t('pipeline.deleteSuccess', 'Lead deleted successfully'));
                } catch (error) {
                    console.error('Failed to delete lead:', error);
                    toast.error(t('pipeline.deleteError', 'Failed to delete lead'));
                }
            }
        });
    };

    const handleConvert = (lead: Lead) => {
        setConfirmModal({
            isOpen: true,
            title: t('pipeline.convertTitle', 'Convert to Client'),
            message: t('pipeline.convertMessage', `Convert ${lead.name} to a client? This will create a new client and mark the lead as WON.`),
            action: async () => {
                try {
                    await leadsApi.convert(lead);
                    loadData();
                    toast.success(t('pipeline.convertSuccess', 'Lead converted successfully!'));
                } catch (error) {
                    console.error('Failed to convert lead:', error);
                    toast.error(t('pipeline.convertError', 'Failed to convert lead.'));
                }
            }
        });
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
                    <h1 className="text-2xl font-bold text-slate-800">{t('pipeline.title', 'Sales Pipeline')}</h1>
                    <p className="text-slate-500">{t('pipeline.subtitle', 'Manage your leads and deals')}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            // Simple CSV export
                            const header = "Name,Email,Company,Status,Value\n";
                            const rows = leads.map(l => `${l.name},${l.email},${l.company || ''},${l.status},${l.value || 0}`).join("\n");
                            const blob = new Blob([header + rows], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
                            a.click();
                            window.URL.revokeObjectURL(url);
                            toast.success(t('common.exportSuccess', 'Data exported to CSV'));
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg shadow-sm hover:bg-slate-200 transition font-medium"
                    >
                        <Download size={18} /> {t('common.export', 'Export CSV')}
                    </button>
                    <button
                        onClick={() => { setEditingLead(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition font-medium"
                    >
                        <Plus size={18} /> {t('pipeline.newLead', 'New Lead')}
                    </button>
                </div>
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
                        className="flex-shrink-0 w-80 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800/60 flex flex-col max-h-full overflow-hidden"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                    >
                        {/* Column Header */}
                        <div className="p-3 border-b border-white/5 flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${stage.color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`}></div>
                                <span className="font-bold text-slate-200 text-sm">{stage.label}</span>
                                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                                    {getLeadsByStage(stage.id).length}
                                </span>
                            </div>
                        </div>

                        {/* Cards Container */}
                        <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scroll min-h-[150px]">
                            <AnimatePresence>
                                {getLeadsByStage(stage.id).map(lead => {
                                    // Generate a deterministic mock AI score based on lead ID for demo purposes
                                    const aiScore = Math.floor((lead.id.charCodeAt(0) + lead.id.charCodeAt(lead.id.length-1)) % 40) + 60;
                                    const isHot = aiScore > 85;
                                    return (
                                    <motion.div
                                        key={lead.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileHover={{ y: -4, scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        draggable
                                        onDragStart={(e: any) => handleDragStart(e, lead)}
                                        className={`bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border ${isHot ? 'border-amber-500/50 shadow-[0_4px_15px_rgba(245,158,11,0.15)]' : 'border-slate-700'} shadow-sm cursor-grab active:cursor-grabbing hover:shadow-lg transition-all group relative overflow-hidden`}
                                    >
                                        {/* AI Glow Effect for Hot Leads */}
                                        {isHot && (
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/20 blur-2xl -z-10 rounded-full mix-blend-screen" />
                                        )}
                                        
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-100 truncate pr-6" title={lead.name}>{lead.name}</h4>
                                            <div className="xl:opacity-0 group-hover:opacity-100 flex gap-1 absolute top-2 right-2 transition-opacity bg-slate-800/90 p-0.5 rounded-lg backdrop-blur-sm border border-slate-700">
                                                <button
                                                    onClick={() => { setEditingLead(lead); setShowModal(true); }}
                                                    className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-accent transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(lead.id)}
                                                    className="p-1.5 hover:bg-red-500/20 rounded-md text-slate-400 hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        {lead.company && (
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
                                                <Building2 size={12} className="text-slate-500" /> {lead.company}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
                                            <Mail size={12} className="text-slate-500" /> <span className="truncate">{lead.email}</span>
                                        </div>

                                        <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                                            <span className="text-sm font-black text-slate-200">
                                                ${lead.value?.toLocaleString() || 0}
                                            </span>
                                            
                                            <div className="flex gap-2 items-center">
                                                {/* Iris AI Lead Score Indicator */}
                                                <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold ${isHot ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-700/50 text-slate-400'}`}>
                                                    <Sparkles size={10} />
                                                    {aiScore}
                                                </div>
                                                
                                                {stage.id === 'NEGOTIATION' && (
                                                    <button
                                                        onClick={() => handleConvert(lead)}
                                                        className="text-[10px] bg-accent/20 text-accent border border-accent/30 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-accent hover:text-black font-bold transition-all"
                                                    >
                                                        <UserPlus size={10} /> Convert
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                    )
                                })}
                            </AnimatePresence>
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
                            toast.success(t('pipeline.saveSuccess', 'Lead saved successfully!'));
                        } catch (error) {
                            console.error('Failed to save lead:', error);
                            toast.error(t('pipeline.saveError', 'Failed to save lead.'));
                        }
                    }}
                />
            )}
            {/* Danger Confirm Modal */}
            <DangerConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                requireType={confirmModal.requireType}
                onConfirm={() => {
                    if (confirmModal.action) confirmModal.action();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
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
