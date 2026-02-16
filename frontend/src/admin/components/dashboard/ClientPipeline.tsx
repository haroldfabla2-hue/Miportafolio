import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Filter } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface ClientPipelineProps {
    data: any[];
}

export const ClientPipeline: React.FC<ClientPipelineProps> = ({ data }) => {
    return (
        <GlassCard className="h-[350px] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Filter className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Client Acquisition Pipeline</h3>
            </div>
            <div className="flex-1 min-h-0 w-full h-full" style={{ minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} tick={{ fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={{ LEAD: '#f59e0b', ACTIVE: '#10b981', CHURNED: '#94a3b8' }[entry.name as string] || '#6366f1'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
};
