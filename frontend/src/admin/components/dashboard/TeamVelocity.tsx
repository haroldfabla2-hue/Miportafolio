import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { Users } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface TeamVelocityProps {
    data: any[];
}

export const TeamVelocity: React.FC<TeamVelocityProps> = ({ data }) => {
    return (
        <GlassCard className="flex-1 flex flex-col min-h-0">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users size={20} className="text-indigo-500" /> Team Velocity
            </h3>
            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="efficiency" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} name="Efficiency %" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
};
