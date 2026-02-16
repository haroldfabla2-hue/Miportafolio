import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import {
    BrainCircuit, Settings, Play, RefreshCw, Users, Brain
} from 'lucide-react';
import { oracleService } from '../../services/oracleService';
import type { SimulationScenario, SimulationResult, ResourceForecast } from '../../types/oracle';

const OracleSkeleton: React.FC = () => (
    <div className="space-y-8 animate-pulse p-10 bg-[#050505] min-h-screen">
        <div className="h-64 bg-white/5 border border-white/10 rounded-[2.5rem] mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-[400px] bg-white/5 border border-white/10 rounded-[2rem]"></div>
            <div className="h-[400px] bg-white/5 border border-white/10 rounded-[2rem]"></div>
        </div>
    </div>
);

const OraclePage: React.FC = () => {
    // Scenario State (Oracle 2.0 Structure)
    const [scenario, setScenario] = useState<SimulationScenario>({
        id: 'custom',
        name: 'Custom Simulation',
        hiringPlan: { 'Junior': 0, 'Mid': 0, 'Senior': 0 },
        clientChurnRate: 5,
        newClientGrowth: 10,
        marketCondition: 'STABLE',
        expenseMultiplier: 1.0
    });

    const [data, setData] = useState<{
        results: SimulationResult[],
        resources: ResourceForecast[],
        recommendation?: string,
        riskLevel?: string,
        financialSnapshot?: {
            startingCash: number;
            monthlyRetainers: number;
            monthlyRecurringCosts: number;
            monthlyPayroll: number;
            totalBurn: number;
            outstandingAR: number;
            outstandingAP: number;
            pipelineValue: number;
        }
    }>({ results: [], resources: [] });

    const [aiAdvice, setAiAdvice] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isThinking, setIsThinking] = useState(false);
    const [activeTab, setActiveTab] = useState<'FINANCIAL' | 'TEAM'>('FINANCIAL');

    // Run Simulation on change
    useEffect(() => {
        const fetchSimulation = async () => {
            setLoading(true);
            try {
                const simData = await oracleService.runSimulation(scenario);
                if (simData && simData.results) {
                    setData(simData);
                }
            } catch (err) {
                console.error("Simulation run failed", err);
            } finally {
                setLoading(false);
            }
        };
        // Debounce slightly to avoid rapid re-renders on slider drag
        const timer = setTimeout(fetchSimulation, 300);
        return () => clearTimeout(timer);
    }, [scenario]);

    const handleConsultOracle = async () => {
        if (data.results.length === 0) return;

        setIsThinking(true);
        const lastResult = data.results[11]; // Month 12
        const context = `
         Simulation End State (Month 12):
         Scenario Cash: $${lastResult?.scenario.cashReserve.toLocaleString()} (Baseline: $${lastResult?.baseline.cashReserve.toLocaleString()}).
         Scenario Profit: $${(lastResult?.scenario.revenue - lastResult?.scenario.expenses).toLocaleString()}.
         Risk Score: ${data.results[11]?.riskScore}/100.
         Inputs: Hiring ${JSON.stringify(scenario.hiringPlan)}, Market ${scenario.marketCondition}, Growth ${scenario.newClientGrowth}%, Churn ${scenario.clientChurnRate}%.
        `;

        const prompt = `
         Act as a CFO for a creative agency.
         Compare the Scenario against the Baseline in the provided context.
         Is the proposed strategy sustainable or reckless?
         Give one specific financial warning and one opportunity based on the numbers.
         Keep it professional, data-driven, and concise.
        `;

        const advice = await oracleService.askOracle(context, prompt);
        setAiAdvice(advice);
        setIsThinking(false);
    };

    const cashRunway = data.results.findIndex(r => r.scenario && r.scenario.cashReserve < 0);
    const runwayText = cashRunway === -1 ? '12+ Months' : `${cashRunway} Months`;
    const endCash = data.results[11]?.scenario.cashReserve || 0;
    const baselineEndCash = data.results[11]?.baseline.cashReserve || 0;
    const cashDiff = endCash - baselineEndCash;

    const updateHiring = (role: string, delta: number) => {
        setScenario(prev => ({
            ...prev,
            hiringPlan: {
                ...prev.hiringPlan,
                [role]: Math.max(0, (prev.hiringPlan[role] || 0) + delta)
            }
        }));
    };

    if (loading && data.results.length === 0) {
        return <OracleSkeleton />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 p-6">
            <div className="relative p-10 rounded-[2.5rem] bg-[#050505] border border-white/10 overflow-hidden shadow-2xl">
                {/* Background Neural Network Animation (Simplified CSS) */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] animate-pulse"></div>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-brand-600/10 border border-brand-500/20 rounded-2xl">
                                <BrainCircuit className="text-brand-500" size={28} />
                            </div>
                            <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em]">Advanced Predictive Engine</span>
                        </div>
                        <h1 className="text-5xl font-black text-white leading-tight mb-4 uppercase tracking-tighter">
                            Oracle <span className="text-brand-500">2.0</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-sm leading-relaxed">
                            Simulate future scenarios with deep-learning precision. Compare strategic hiring, market shifts, and growth trajectories against your current financial baseline.
                        </p>
                    </div>

                    <div className="flex gap-12 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-xl">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Projected Runway</p>
                            <p className={`text-4xl font-black ${cashRunway !== -1 ? 'text-rose-500' : 'text-brand-500'}`}>{runwayText}</p>
                            <div className="mt-2 flex items-center justify-end gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${cashRunway !== -1 ? 'bg-rose-500' : 'bg-brand-500'} animate-ping`}></div>
                                <span className="text-[9px] font-black text-slate-400 uppercase">Operational Safety</span>
                            </div>
                        </div>
                        <div className="w-px h-16 bg-white/10"></div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Scenario Alpha</p>
                            <p className={`text-4xl font-black ${cashDiff >= 0 ? 'text-brand-500' : 'text-rose-500'}`}>
                                {cashDiff > 0 ? '+' : ''}${Math.round(cashDiff / 1000)}k
                            </p>
                            <span className="text-[9px] font-black text-slate-500 uppercase">Equity Delta vs Baseline</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* CONTROLS SIDEBAR */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-[#111] p-8 rounded-[2rem] border border-white/10 shadow-2xl">
                        <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <Settings size={14} /> Control Parameters
                        </h3>

                        <div className="space-y-10">
                            {/* Hiring Plan */}
                            <div className="space-y-4">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Neural Headcount Expansion</label>
                                <div className="space-y-2">
                                    {(['Junior', 'Mid', 'Senior'] as Array<'Junior' | 'Mid' | 'Senior'>).map(role => (
                                        <div key={role} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                            <span className="text-xs font-bold text-slate-300">{role}</span>
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => updateHiring(role, -1)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg hover:bg-white/10 transition-all text-slate-400 font-black">-</button>
                                                <span className="text-xs font-black text-white w-4 text-center">{scenario.hiringPlan[role] || 0}</span>
                                                <button onClick={() => updateHiring(role, 1)} className="w-8 h-8 flex items-center justify-center bg-brand-500/10 rounded-lg hover:bg-brand-500/20 transition-all text-brand-500 font-black">+</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Market */}
                            <div className="space-y-4">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Market Volatility Context</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['BOOM', 'STABLE', 'RECESSION'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setScenario({ ...scenario, marketCondition: m as any })}
                                            className={`py-3 text-[10px] font-black rounded-xl border transition-all ${scenario.marketCondition === m
                                                ? (m === 'BOOM' ? 'bg-brand-600 border-brand-500 text-black shadow-lg shadow-brand-500/20' : m === 'RECESSION' ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white/10 border-white/20 text-white shadow-lg')
                                                : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Growth Section */}
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-[9px] font-black text-slate-500 uppercase">Growth Velocity</label>
                                        <span className="text-xs font-black text-brand-500">+{scenario.newClientGrowth}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="50" step="5"
                                        value={scenario.newClientGrowth}
                                        onChange={(e) => setScenario({ ...scenario, newClientGrowth: parseInt(e.target.value) })}
                                        className="w-full accent-brand-500 cursor-pointer h-1.5 bg-white/10 rounded-full appearance-none"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-[9px] font-black text-slate-500 uppercase">Friction / Churn</label>
                                        <span className="text-xs font-black text-rose-500">{scenario.clientChurnRate}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="30" step="1"
                                        value={scenario.clientChurnRate}
                                        onChange={(e) => setScenario({ ...scenario, clientChurnRate: parseInt(e.target.value) })}
                                        className="w-full accent-rose-500 cursor-pointer h-1.5 bg-white/10 rounded-full appearance-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setScenario({
                                    id: 'reset', name: 'Reset', hiringPlan: { 'Junior': 0, 'Mid': 0, 'Senior': 0 }, clientChurnRate: 5,
                                    newClientGrowth: 10, marketCondition: 'STABLE', expenseMultiplier: 1.0
                                })}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all"
                            >
                                <RefreshCw size={12} className="inline mr-2" /> Reset Matrix
                            </button>
                        </div>
                    </div>
                </div>

                {/* VISUALIZATIONS MAIN AREA */}
                <div className="lg:col-span-9 space-y-6">

                    {/* AI INSIGHT BAR */}
                    <div className="bg-[#111] border border-brand-500/20 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-2xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-brand-500/[0.02] group-hover:bg-brand-500/[0.04] transition-colors"></div>

                        <div className="flex-1 flex gap-6 items-start relative z-10">
                            <div className="p-4 bg-brand-600/10 border border-brand-500/20 rounded-2xl text-brand-500 shadow-lg shadow-brand-500/5">
                                <BrainCircuit size={28} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-1">Neural Advice Matrix</h4>
                                <p className="text-sm font-bold text-white line-clamp-3 leading-relaxed">
                                    {isThinking ? "Accessing cognitive layers..." : aiAdvice || "Adjust the matrix variables on the left to activate the Oracle's strategic analysis engine."}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleConsultOracle}
                            disabled={isThinking || data.results.length === 0}
                            className="px-8 py-5 bg-brand-600 hover:bg-brand-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-500/20 transition-all flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed relative z-10"
                        >
                            {isThinking ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
                            Execute Analysis
                        </button>
                    </div>

                    {/* TABS */}
                    <div className="flex gap-4 border-b border-white/10 px-2">
                        {(['FINANCIAL', 'TEAM'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-brand-500 border-b-2 border-brand-500' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {tab === 'FINANCIAL' ? 'Neural Cash Flow' : 'Resource Equilibrium'}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'FINANCIAL' ? (
                        <div className="space-y-6">
                            {/* Financial Snapshot */}
                            {data.financialSnapshot && (
                                <div className="bg-[#080808] border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[80px] rounded-full"></div>
                                    <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2 relative z-10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
                                        Cognitive Financial Baseline
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                                        {[
                                            { label: 'Retainer Matrix', val: data.financialSnapshot.monthlyRetainers, color: 'text-brand-500', bg: 'bg-brand-500/5' },
                                            { label: 'Outstanding Receivables', val: data.financialSnapshot.outstandingAR, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                                            { label: 'Pipeline Energy', val: data.financialSnapshot.pipelineValue, color: 'text-purple-500', bg: 'bg-purple-500/5' },
                                            { label: 'Liquid Reserves', val: data.financialSnapshot.startingCash, color: 'text-brand-500', bg: 'bg-brand-500/10' },
                                            { label: 'Payable Commitments', val: data.financialSnapshot.outstandingAP, color: 'text-rose-500', bg: 'bg-rose-500/5' },
                                            { label: 'Personnel Burn', val: data.financialSnapshot.monthlyPayroll, color: 'text-amber-500', bg: 'bg-amber-500/5' },
                                            { label: 'Operational Friction', val: data.financialSnapshot.monthlyRecurringCosts, color: 'text-orange-500', bg: 'bg-orange-500/5' },
                                            { label: 'Total Monthly Extraction', val: data.financialSnapshot.totalBurn, color: 'text-rose-500', bg: 'bg-rose-500/10', highlight: true },
                                        ].map((item, idx) => (
                                            <div key={idx} className={`${item.bg} border ${item.highlight ? 'border-rose-500/30' : 'border-white/5'} p-5 rounded-2xl hover:border-white/10 transition-all group`}>
                                                <p className={`text-[9px] font-black ${item.color} uppercase tracking-widest mb-1 opacity-70 group-hover:opacity-100 transition-opacity`}>{item.label}</p>
                                                <p className="text-2xl font-black text-white mt-1 tracking-tighter">${item.val.toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cash Flow Comparison Chart */}
                            <div className="bg-[#111] border border-white/10 p-8 rounded-[2rem] shadow-2xl h-[450px]">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Reserves Projection</h3>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Baseline vs Simulation Alpha</h2>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/10"></div><span className="text-[9px] font-black text-slate-500 uppercase">Baseline</span></div>
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-500"></div><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Scenario</span></div>
                                    </div>
                                </div>
                                <div className="w-full h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data.results}>
                                            <defs>
                                                <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#A3FF00" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#A3FF00" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px' }}
                                                itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                                labelStyle={{ color: '#666', fontSize: '9px', fontWeight: 900, marginBottom: '4px' }}
                                                formatter={(val: any) => [`$${val.toLocaleString()}`, '']}
                                            />
                                            <Area type="monotone" dataKey="baseline.cashReserve" name="Baseline" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="6 6" fill="none" />
                                            <Area type="monotone" dataKey="scenario.cashReserve" name="Scenario" stroke="#A3FF00" strokeWidth={3} fill="url(#colorScenario)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Burn Rate Comparison */}
                            <div className="bg-[#111] border border-white/10 p-8 rounded-[2rem] shadow-2xl h-[350px]">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Dynamic Monthly Extraction</h3>
                                <div className="w-full h-[220px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.results}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} />
                                            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                itemStyle={{ fontSize: '10px', fontWeight: 900 }}
                                            />
                                            <Bar dataKey="baseline.expenses" name="Baseline" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} barSize={24} />
                                            <Bar dataKey="scenario.expenses" name="Scenario" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-[#111] p-8 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[50px] rounded-full"></div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex justify-between items-center relative z-10">
                                    <span>Resource Fatigue Analysis</span>
                                    {data.results.length > 0 && (
                                        <span className={`px-3 py-1 rounded-lg border ${data.results[11]?.teamUtilization > 90 ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-brand-500/10 border-brand-500/20 text-brand-500'}`}>
                                            Global Load: {data.results[11]?.teamUtilization}%
                                        </span>
                                    )}
                                </h3>
                                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 relative z-10 custom-scrollbar">
                                    {data.resources.map(r => (
                                        <div key={r.userId} className="group">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-xs font-black text-white uppercase tracking-tighter">{r.userName}</span>
                                                <span className={`text-[10px] font-black ${r.burnoutRisk > 75 ? 'text-rose-500' : r.burnoutRisk > 50 ? 'text-amber-500' : 'text-brand-500'}`}>{Math.round(r.burnoutRisk)}% Entropy</span>
                                            </div>
                                            <div className="bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/[0.02]">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${r.burnoutRisk}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className={`h-full ${r.burnoutRisk > 75 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : r.burnoutRisk > 50 ? 'bg-amber-500' : 'bg-brand-500 shadow-[0_0_10px_rgba(163,255,0,0.3)]'}`}
                                                ></motion.div>
                                            </div>
                                        </div>
                                    ))}
                                    {data.resources.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <Brain size={40} className="text-slate-800 mb-4" />
                                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">No spectral data detected</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-[#111] p-10 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col justify-center items-center text-center relative overflow-hidden">
                                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full"></div>
                                <div className="w-24 h-24 bg-brand-500/10 border border-brand-500/20 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-brand-500/5">
                                    <Users size={40} className="text-brand-500" />
                                </div>
                                <h3 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">
                                    +{Object.values(scenario.hiringPlan).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0)} Nodes
                                </h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-10">Proposed Capacity Expansion</p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {Object.entries(scenario.hiringPlan).map(([role, count]) => (
                                        count > 0 && (
                                            <span key={role} className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                {count} {role}
                                            </span>
                                        )
                                    ))}
                                    {Object.values(scenario.hiringPlan).every(v => v === 0) && (
                                        <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic opacity-50">Current Configuration Maintained</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default OraclePage;
