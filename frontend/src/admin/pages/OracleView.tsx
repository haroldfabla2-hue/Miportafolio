import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import {
    Play, RefreshCw,
    BrainCircuit, Users
} from 'lucide-react';
import { oracleService } from '../../services/oracleService';
import { SimulationScenario, SimulationResult } from '../../types/oracle';
// import { useAuth } from '../../context/AuthContext'; // If needed for user role checks

export const OracleView: React.FC = () => {
    // const { user } = useAuth(); 

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
        resources: any[],
        prediction?: string,
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
    const [isThinking, setIsThinking] = useState(false);
    const [activeTab, setActiveTab] = useState<'FINANCIAL' | 'TEAM'>('FINANCIAL');

    // Run Simulation on change
    useEffect(() => {
        const fetchSimulation = async () => {
            const simData = await oracleService.runSimulation(scenario);
            if (simData && simData.results) {
                setData(simData);
            }
        };
        // Debounce slightly to avoid rapid re-renders on slider drag
        const timer = setTimeout(fetchSimulation, 300);
        return () => clearTimeout(timer);
    }, [scenario]);

    const handleConsultOracle = async () => {
        setIsThinking(true);
        const lastResult = data.results[11]; // Month 12
        const context = `
         Simulation End State (Month 12):
         Scenario Cash: $${lastResult?.scenario.cashReserve} (Baseline: $${lastResult?.baseline.cashReserve}).
         Scenario Profit: $${lastResult?.scenario.revenue - lastResult?.scenario.expenses}.
         Risk Score: ${data.results[11]?.riskScore}.
         Inputs: Hiring ${JSON.stringify(scenario.hiringPlan)}, Market ${scenario.marketCondition}, Growth ${scenario.newClientGrowth}%.
      `;

        const advice = await oracleService.askOracle(context, `
         Act as a CFO for a creative agency. 
         Compare the Scenario against the Baseline. Is the proposed growth strategy sustainable or reckless?
         Give one specific financial warning and one opportunity.
      `);

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

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 p-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 text-white p-8 rounded-3xl shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-indigo-900/20 pointer-events-none"></div>
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>

                <div className="relative z-10 mb-6 md:mb-0">
                    <h1 className="text-4xl font-black flex items-center gap-4 tracking-tight">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                            <BrainCircuit className="text-purple-400" size={32} />
                        </div>
                        Oracle Engine 2.0
                    </h1>
                    <p className="text-indigo-200 mt-2 font-medium text-lg max-w-xl">Advanced Predictive Modeling. Compare strategic scenarios against your current baseline to find the optimal path.</p>
                </div>

                <div className="relative z-10 flex gap-8">
                    <div className="text-right">
                        <p className="text-xs text-indigo-300 uppercase font-bold tracking-widest mb-1">Projected Runway</p>
                        <p className={`text-3xl font-black ${cashRunway !== -1 ? 'text-rose-400' : 'text-emerald-400'}`}>{runwayText}</p>
                    </div>
                    <div className="h-12 w-px bg-indigo-800"></div>
                    <div className="text-right">
                        <p className="text-xs text-indigo-300 uppercase font-bold tracking-widest mb-1">Scenario Impact</p>
                        <p className={`text-3xl font-black flex items-center gap-1 justify-end ${cashDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {cashDiff > 0 ? '+' : ''}${Math.round(cashDiff / 1000)}k
                        </p>
                        <span className="text-xs text-indigo-400">vs Baseline</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* CONTROLS SIDEBAR */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                            <SettingsControl size={20} /> Scenario Variables
                        </h3>

                        <div className="space-y-8">
                            {/* Hiring Plan */}
                            <div>
                                <label className="font-bold text-slate-700 block mb-3 text-sm uppercase tracking-wide">Hiring Plan</label>
                                <div className="space-y-3">
                                    {['Junior', 'Mid', 'Senior'].map(role => (
                                        <div key={role} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                            <span className="text-sm font-semibold text-slate-600">{role}</span>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => updateHiring(role, -1)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:border-slate-300 shadow-sm transition-colors text-slate-500 font-bold">-</button>
                                                <span className="text-base font-bold text-slate-900 w-4 text-center">{scenario.hiringPlan[role] || 0}</span>
                                                <button onClick={() => updateHiring(role, 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:border-slate-300 shadow-sm transition-colors text-indigo-600 font-bold">+</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Market */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Market Context</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['BOOM', 'STABLE', 'RECESSION'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setScenario({ ...scenario, marketCondition: m as any })}
                                            className={`py-3 text-[10px] font-black rounded-xl transition-all shadow-sm ${scenario.marketCondition === m
                                                ? (m === 'BOOM' ? 'bg-emerald-500 text-white shadow-emerald-200' : m === 'RECESSION' ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-indigo-500 text-white shadow-indigo-200')
                                                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Growth Section */}
                            <div className="bg-slate-50/50 p-4 rounded-2xl space-y-4 border border-slate-100">
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <label className="font-bold text-slate-700">New Business</label>
                                        <span className="font-bold text-emerald-600">+{scenario.newClientGrowth}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="50" step="5"
                                        value={scenario.newClientGrowth}
                                        onChange={(e) => setScenario({ ...scenario, newClientGrowth: parseInt(e.target.value) })}
                                        className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 rounded-full appearance-none"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <label className="font-bold text-slate-700">Churn Rate</label>
                                        <span className="font-bold text-rose-500">{scenario.clientChurnRate}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="30" step="1"
                                        value={scenario.clientChurnRate}
                                        onChange={(e) => setScenario({ ...scenario, clientChurnRate: parseInt(e.target.value) })}
                                        className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-200 rounded-full appearance-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setScenario({
                                    id: 'reset', name: 'Reset', hiringPlan: { 'Junior': 0, 'Mid': 0, 'Senior': 0 }, clientChurnRate: 5,
                                    newClientGrowth: 10, marketCondition: 'STABLE', expenseMultiplier: 1.0
                                })}
                                className="w-full py-3 border-2 border-slate-100 rounded-xl text-slate-500 font-bold hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                            >
                                <RefreshCw size={16} /> Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* VISUALIZATIONS MAIN AREA */}
                <div className="lg:col-span-9 space-y-6">

                    {/* AI INSIGHT BAR */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-sm">
                        <div className="flex-1 flex gap-4 items-start">
                            <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                                <BrainCircuit size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Strategic Insight</h4>
                                <p className="text-sm text-slate-600 mt-1">
                                    {isThinking ? "Thinking..." : aiAdvice || data.prediction || "Adjust scenario variables to generate insight."}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleConsultOracle}
                            disabled={isThinking}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {isThinking ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
                            Generate Analysis
                        </button>
                    </div>

                    {/* TABS */}
                    <div className="flex gap-4 border-b border-slate-200">
                        <button onClick={() => setActiveTab('FINANCIAL')} className={`pb-4 text-sm font-bold transition-colors ${activeTab === 'FINANCIAL' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                            Financial & Cash Flow
                        </button>
                        <button onClick={() => setActiveTab('TEAM')} className={`pb-4 text-sm font-bold transition-colors ${activeTab === 'TEAM' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                            Team & Capacity
                        </button>
                    </div>

                    {activeTab === 'FINANCIAL' ? (
                        <div className="space-y-6">
                            {/* 0. Financial Snapshot (Real Data from Oracle 3.0) */}
                            {data.financialSnapshot && (
                                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl shadow-xl">
                                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                        Real-Time Financial Position
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {/* Money In */}
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wide">Monthly Retainers</p>
                                            <p className="text-2xl font-black text-white mt-1">${data.financialSnapshot.monthlyRetainers.toLocaleString()}</p>
                                            <p className="text-xs text-slate-400 mt-1">Guaranteed income</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <p className="text-xs text-blue-400 font-bold uppercase tracking-wide">Outstanding AR</p>
                                            <p className="text-2xl font-black text-white mt-1">${data.financialSnapshot.outstandingAR.toLocaleString()}</p>
                                            <p className="text-xs text-slate-400 mt-1">Invoices to collect</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <p className="text-xs text-purple-400 font-bold uppercase tracking-wide">Pipeline Value</p>
                                            <p className="text-2xl font-black text-white mt-1">${data.financialSnapshot.pipelineValue.toLocaleString()}</p>
                                            <p className="text-xs text-slate-400 mt-1">Leads @ 30% conversion</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <p className="text-xs text-cyan-400 font-bold uppercase tracking-wide">Starting Cash</p>
                                            <p className="text-2xl font-black text-white mt-1">${data.financialSnapshot.startingCash.toLocaleString()}</p>
                                            <p className="text-xs text-slate-400 mt-1">Current position</p>
                                        </div>
                                        {/* Money Out */}
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <p className="text-xs text-rose-400 font-bold uppercase tracking-wide">Outstanding AP</p>
                                            <p className="text-2xl font-black text-white mt-1">${data.financialSnapshot.outstandingAP.toLocaleString()}</p>
                                            <p className="text-xs text-slate-400 mt-1">Bills to pay</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <p className="text-xs text-amber-400 font-bold uppercase tracking-wide">Monthly Payroll</p>
                                            <p className="text-2xl font-black text-white mt-1">${data.financialSnapshot.monthlyPayroll.toLocaleString()}</p>
                                            <p className="text-xs text-slate-400 mt-1">Team salaries</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <p className="text-xs text-orange-400 font-bold uppercase tracking-wide">Recurring Costs</p>
                                            <p className="text-2xl font-black text-white mt-1">${data.financialSnapshot.monthlyRecurringCosts.toLocaleString()}</p>
                                            <p className="text-xs text-slate-400 mt-1">Rent, software, etc.</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-rose-500/30">
                                            <p className="text-xs text-rose-400 font-bold uppercase tracking-wide">Total Monthly Burn</p>
                                            <p className="text-2xl font-black text-rose-400 mt-1">${data.financialSnapshot.totalBurn.toLocaleString()}</p>
                                            <p className="text-xs text-slate-400 mt-1">Payroll + Fixed costs</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* 1. Cash Flow Comparison Chart */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 h-[400px]">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="font-bold text-slate-800 text-xl">Cash Position: Baseline vs Scenario</h3>
                                    <div className="flex gap-4 text-xs font-bold">
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300"></div>Baseline</div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500"></div>Scenario</div>
                                    </div>
                                </div>
                                <div className="w-full h-[300px]" style={{ minHeight: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data.results}>
                                            <defs>
                                                <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                                                formatter={(val: number) => [`$${val.toLocaleString()}`, '']}
                                            />
                                            {/* Baseline (Dashed) */}
                                            <Area type="monotone" dataKey="baseline.cashReserve" name="Baseline Cash" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                                            {/* Scenario (Solid) */}
                                            <Area type="monotone" dataKey="scenario.cashReserve" name="Scenario Cash" stroke="#6366f1" strokeWidth={3} fill="url(#colorScenario)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 2. Expenses Breakdown */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 h-[300px]">
                                <h3 className="font-bold text-slate-800 mb-6 text-xl">Burn Rate Comparison</h3>
                                <div className="w-full h-[200px]" style={{ minHeight: '200px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.results}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                                            <Bar dataKey="baseline.expenses" name="Baseline Expenses" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                                            <Bar dataKey="scenario.expenses" name="Scenario Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 3. Team Capacity */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
                                <h3 className="font-bold text-slate-800 mb-4 flex justify-between items-center">
                                    <span>Team Burnout Risk</span>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${data.results[11]?.teamUtilization > 90 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        Avg Util: {data.results[11]?.teamUtilization}%
                                    </span>
                                </h3>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                    {data.resources.map(r => (
                                        <div key={r.userId} className="flex items-center gap-4">
                                            <div className="w-32 text-sm font-medium text-slate-600 truncate">{r.userName}</div>
                                            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${r.burnoutRisk > 75 ? 'bg-rose-500' : r.burnoutRisk > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${r.burnoutRisk}%` }}
                                                ></div>
                                            </div>
                                            <div className="w-10 text-sm font-bold text-right text-slate-700">{Math.round(r.burnoutRisk)}%</div>
                                        </div>
                                    ))}
                                    {data.resources.length === 0 && <p className="text-slate-400 text-sm">No team data available for this simulation.</p>}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-center items-center text-center p-8">
                                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                                    <Users size={40} className="text-indigo-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">
                                    +{Object.values(scenario.hiringPlan).reduce((a, b) => a + b, 0)} New Hires
                                </h3>
                                <p className="text-slate-500 mb-6">Proposed headcount increase in this scenario.</p>
                                <div className="flex gap-2 text-sm font-semibold text-slate-600">
                                    {Object.entries(scenario.hiringPlan).map(([role, count]) => (
                                        count > 0 && <span key={role} className="px-3 py-1 bg-slate-100 rounded-lg">{count} {role}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

// Icon helper
const SettingsControl = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);

export default OracleView;
