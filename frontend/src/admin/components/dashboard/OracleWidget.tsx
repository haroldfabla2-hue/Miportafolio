import React from 'react';
import { BrainCircuit, RefreshCw, Sparkles } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { PredictiveInsight } from '../../../types/analytics';

interface OracleWidgetProps {
    insight: PredictiveInsight | null;
    isAnalyzing: boolean;
    onRunPrediction: () => void;
    onExecuteAction: () => void;
}

export const OracleWidget: React.FC<OracleWidgetProps> = ({ insight, isAnalyzing, onRunPrediction, onExecuteAction }) => {
    return (
        <GlassCard className="glass-card bg-gradient-to-br from-[#1e0a2e] to-[#2d0f45] text-white border-brand-500/20 shadow-2xl relative overflow-hidden group p-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/30 transition-all duration-700 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 font-[Outfit]">
                        <BrainCircuit size={20} className="text-accent" /> Oracle Insight
                    </h3>
                    <button
                        onClick={onRunPrediction}
                        disabled={isAnalyzing}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 text-brand-200"
                    >
                        <RefreshCw size={16} className={isAnalyzing ? 'animate-spin' : ''} />
                    </button>
                </div>

                {insight ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${insight.riskLevel === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
                                insight.riskLevel === 'HIGH' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                }`}>
                                {insight.riskLevel} RISK
                            </div>
                        </div>
                        <p className="text-sm text-brand-100 leading-relaxed font-medium">
                            {insight.prediction}
                        </p>
                        <div className="p-4 bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm">
                            <p className="text-[10px] text-brand-300 font-bold uppercase mb-1 tracking-wider">Recommendation</p>
                            <p className="text-xs text-white mb-3">{insight.recommendation}</p>

                            {/* PRESCRIPTIVE ACTION BUTTON */}
                            <button
                                onClick={onExecuteAction}
                                className="w-full py-2.5 bg-accent hover:bg-yellow-400 text-brand-900 rounded-lg text-xs font-extrabold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                            >
                                <Sparkles size={14} /> Execute AI Recommendation
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-brand-300/50">
                        <Sparkles size={32} className="mx-auto mb-2 opacity-50 text-brand-500" />
                        <p className="text-xs uppercase tracking-widest font-bold">Analysis Pending</p>
                    </div>
                )}
            </div>
        </GlassCard>
    );
};
