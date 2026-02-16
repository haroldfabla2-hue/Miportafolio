import React from 'react';
import { CheckCircle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import type { User, Project, Asset } from '../../../types/models';
import { AssetStatus } from '../../../types/models';

interface ClientDashboardProps {
    user: User;
    projects: Project[];
    assets: Asset[];
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ projects, assets }) => {
    const approvedAssets = assets.filter(a =>
        projects.some(p => p.id === a.projectId) &&
        a.status === AssetStatus.DELIVERED
    );

    const totalAssets = approvedAssets.length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <GlassCard className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
                <div className="flex items-center gap-6">
                    <div className="p-6 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200">
                        <CheckCircle size={40} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800">{totalAssets} Assets Delivered</h2>
                        <p className="text-slate-600 font-medium">Across all your active projects with Brandistry.</p>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="font-bold text-slate-800 mb-2 text-xl">Project Status</h3>
                    <p className="text-sm text-slate-500 mb-8">Real-time progress of your active engagements.</p>
                    <div className="space-y-8">
                        {projects.map(p => (
                            <div key={p.id}>
                                <div className="flex justify-between mb-3">
                                    <span className="font-bold text-slate-700">{p.name}</span>
                                    <span className="font-black text-brand-600">{p.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                    <div className="bg-brand-500 h-4 rounded-full transition-all duration-1000 shadow-lg shadow-brand-200" style={{ width: `${p.progress}%` }}></div>
                                </div>
                                <div className="flex justify-between mt-3 text-xs text-slate-400 font-medium">
                                    <span>Started: {new Date(p.startDate).toLocaleDateString()}</span>
                                    <span>Deadline: {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'Ongoing'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
                <GlassCard>
                    <h3 className="font-bold text-slate-800 mb-2 text-xl">Recent Deliverables</h3>
                    <p className="text-sm text-slate-500 mb-8">Assets approved and ready for download.</p>
                    <div className="space-y-4">
                        {approvedAssets.slice(0, 3).map(asset => (
                            <div key={asset.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all hover:shadow-md">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                    <CheckCircle size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-800">{asset.title}</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-1">v{asset.version} • Delivered</p>
                                </div>
                            </div>
                        ))}
                        {approvedAssets.length === 0 && <p className="text-sm text-slate-400 italic">No assets delivered yet.</p>}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
