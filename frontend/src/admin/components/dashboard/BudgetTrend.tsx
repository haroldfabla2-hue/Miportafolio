import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface BudgetTrendProps {
    data: any[];
}

export const BudgetTrend: React.FC<BudgetTrendProps> = ({ data }) => {
    return (
        <GlassCard>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <PieChartIcon size={20} className="text-emerald-500" /> Budget Allocation
                </h3>
            </div>
            <div className="h-64 w-full min-h-[256px]">
                <ResponsiveContainer width="100%" height={256}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} />
                        <Legend />
                        <Bar dataKey="budget" name="Total Budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="spent" name="Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
};
