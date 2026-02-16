import React from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { Maximize2, Minimize2, Activity } from 'lucide-react';

interface RiskMatrixProps {
    data: any[];
    zoomed: boolean;
    onToggleZoom: () => void;
    onChartClick: (data: any) => void;
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({ data, zoomed, onToggleZoom, onChartClick }) => {
    return (
        <div className={`glass-card col-span-2 flex flex-col relative overflow-hidden ${zoomed ? 'fixed inset-4 z-50 h-auto' : 'h-[500px] lg:h-full'}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 font-[Outfit]">
                        <Activity size={20} className="text-rose-500" /> Project Risk Matrix
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-brand-200">Time Elapsed vs. Budget Burn. <span className="font-bold text-brand-600 dark:text-accent">Click a bubble to manage.</span></p>
                </div>
                <button onClick={onToggleZoom} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 dark:text-brand-200">
                    {zoomed ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
            </div>
            <div className="flex-1 w-full min-h-[400px]">
                <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }} onClick={onChartClick}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.1} />
                        <XAxis type="number" dataKey="x" name="Time" unit="%" label={{ value: 'Time Elapsed (%)', position: 'insideBottomRight', offset: -10, fill: '#94a3b8' }} tick={{ fill: '#94a3b8' }} />
                        <YAxis type="number" dataKey="y" name="Budget" unit="%" label={{ value: 'Budget Spent (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} tick={{ fill: '#94a3b8' }} />
                        <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Budget Volume" />
                        <RechartsTooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', background: 'rgba(30, 10, 46, 0.9)', backdropFilter: 'blur(10px)', color: '#fff', padding: '12px' }}
                        />
                        <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                        <Scatter name="Projects" data={data} fill="#8b5cf6" shape="circle" className="cursor-pointer">
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.y > entry.x ? '#f43f5e' : '#10b981'} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
