import React from 'react';
import {
    PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface RevenueBreakdownProps {
    data: any[];
}

export const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({ data }) => {
    return (
        <GlassCard className="h-[350px] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <PieChartIcon className="w-5 h-5 text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Revenue Breakdown</h3>
            </div>
            <div className="flex-1 min-h-0 w-full h-full" style={{ minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][index % 5]} />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                            formatter={(value: any) => `$${value.toLocaleString()}`}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
};
