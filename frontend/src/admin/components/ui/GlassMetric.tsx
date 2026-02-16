import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface GlassMetricProps {
    title: string;
    value: string;
    subtext: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
}

export const GlassMetric: React.FC<GlassMetricProps> = ({ title, value, subtext, icon, trend }) => (
    <GlassCard className="relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            {React.cloneElement(icon as React.ReactElement, { size: 64 } as any)}
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-brand-50 dark:bg-brand-900/50 rounded-xl shadow-sm text-brand-600 dark:text-brand-300">
                    {icon}
                </div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
            </div>
            <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-[Outfit] font-black text-slate-800 dark:text-white tracking-tight">{value}</h2>
                {trend && (
                    <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                        trend === 'down' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {subtext}
                    </span>
                )}
            </div>
            {!trend && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{subtext}</p>}
        </div>
    </GlassCard>
);
