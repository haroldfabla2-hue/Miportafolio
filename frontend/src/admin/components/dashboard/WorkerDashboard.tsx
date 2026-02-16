import React from 'react';
import { Calendar } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import type { User, Project, Task } from '../../../types/models';

interface WorkerDashboardProps {
    user: User;
    projects: Project[];
    tasks: Task[];
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ user, projects, tasks }) => {
    const pendingTasks = tasks.filter(t => t.status !== 'DONE');
    const highPriority = pendingTasks.filter(t => t.priority === 'HIGH').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h2 className="text-4xl font-black mb-2 relative z-10">Hello, {user.name}</h2>
                <p className="opacity-90 text-lg relative z-10">You have {pendingTasks.length} tasks pending today. {highPriority} are high priority.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-bold text-slate-700 text-xl px-2">My Active Projects</h3>
                    {projects.map(p => (
                        <GlassCard key={p.id} className="flex justify-between items-center cursor-pointer hover:border-brand-200 group">
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg group-hover:text-brand-600 transition-colors">{p.name}</h4>
                                <p className="text-sm text-slate-500">{p.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-3xl font-black text-brand-600">{p.progress}%</span>
                                <span className="text-xs text-slate-400 font-bold uppercase">Completion</span>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                <GlassCard className="h-fit">
                    <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 text-xl"><Calendar size={20} className="text-brand-500" /> Upcoming Deadlines</h3>
                    <div className="space-y-4">
                        {pendingTasks.slice(0, 5).map(t => (
                            <div key={t.id} className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                                <div className={`w-1.5 h-full min-h-[40px] rounded-full ${t.priority === 'HIGH' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{t.title}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
