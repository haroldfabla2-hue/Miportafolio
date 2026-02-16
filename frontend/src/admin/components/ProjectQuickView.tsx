import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, MessageSquare, ExternalLink, TrendingUp, AlertTriangle } from 'lucide-react';
import { Project, ProjectStatus } from '../../types/models';
import { useStore } from '../../context/StoreContext';

interface ProjectQuickViewProps {
    project: Project;
    onClose: () => void;
    onAction?: (action: string, payload?: any) => void;
}

const ProjectQuickView: React.FC<ProjectQuickViewProps> = ({ project, onClose, onAction }) => {
    const { users } = useStore();
    const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'team'>('overview');

    // Find manager from teamIds
    const teamMembers = users.filter(u => project.teamIds?.includes(u.id));
    const projectManager = teamMembers[0]; // Logic fallback

    const statusColors: Record<string, string> = {
        'PLANNING': 'bg-blue-100 text-blue-700 border-blue-200',
        'ACTIVE': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'REVIEW': 'bg-amber-100 text-amber-700 border-amber-200',
        'COMPLETED': 'bg-slate-100 text-slate-700 border-slate-200',
        'ON_HOLD': 'bg-rose-100 text-rose-700 border-rose-200'
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-white border border-white/20 shadow-2xl rounded-3xl overflow-hidden"
                >
                    {/* HEADER */}
                    <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-black text-slate-800">{project.name}</h2>
                                <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full border ${statusColors[project.status] || 'bg-slate-100'}`}>
                                    {project.status}
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm line-clamp-1">{project.description}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>

                    {/* TABS */}
                    <div className="flex border-b border-slate-100 px-6 bg-white">
                        {['overview', 'financials', 'team'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-3 text-sm font-bold capitalize transition-colors border-b-2 ${activeTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* CONTENT */}
                    <div className="p-6 min-h-[350px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Progress</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-black text-slate-800">{project.progress}%</span>
                                            <span className="text-[10px] text-emerald-600 font-black mb-1 flex items-center">
                                                <TrendingUp size={12} className="mr-1" /> ON TRACK
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${project.progress}%` }}
                                                className="bg-brand-600 h-1.5 rounded-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Deadline</p>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                                                <Calendar size={20} className="text-brand-600" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-slate-800">
                                                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                    {project.endDate ? `${Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left` : 'No deadline'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* QUICK ACTIONS */}
                                <div className="pt-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3">Quick Execution</h3>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => onAction?.('message_team', project.id)}
                                            className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare size={16} /> Team
                                        </button>
                                        <button
                                            onClick={() => window.location.href = `/admin/projects/${project.id}`}
                                            className="flex-2 px-6 py-3 bg-brand-600 text-white rounded-xl text-sm font-black hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
                                        >
                                            VIEW DETAILS <ExternalLink size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'financials' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-5 bg-slate-900 text-white rounded-2xl">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Allocated</p>
                                        <p className="text-3xl font-black">${project.budget?.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Burn Rate</p>
                                        <p className={`text-3xl font-black ${(project.spent || 0) > project.budget ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            ${project.spent?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                </div>

                                {(project.spent || 0) > project.budget && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4">
                                        <div className="p-2 bg-rose-100 rounded-lg">
                                            <AlertTriangle className="text-rose-600" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-rose-800">Budget Threshold Exceeded</p>
                                            <p className="text-xs text-rose-600/80 mt-1">This project is currently over budget. Financial audit recommended.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'team' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase">Deployed Specialists</h3>
                                    <span className="text-[10px] font-black text-brand-600">{teamMembers.length} ACTIVE</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {teamMembers.map(user => (
                                        <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                            <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{user.specialty || 'AGENT'}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {teamMembers.length === 0 && (
                                        <p className="col-span-2 text-center py-8 text-slate-400 text-sm italic">No team members assigned yet.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProjectQuickView;
