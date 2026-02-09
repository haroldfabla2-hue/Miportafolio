import React, { useState } from 'react';

// Types
interface OracleInsight {
    id: string;
    title: string;
    description: string;
    type: 'revenue' | 'risk' | 'opportunity' | 'trend';
    priority: 'high' | 'medium' | 'low';
    metric?: string;
    change?: number;
    actionable: boolean;
}

interface Prediction {
    label: string;
    current: number;
    predicted: number;
    confidence: number;
}

const typeIcons: Record<string, string> = {
    revenue: '💰',
    risk: '⚠️',
    opportunity: '🚀',
    trend: '📈'
};

const priorityColors: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e'
};

// Insight Card
const InsightCard: React.FC<{ insight: OracleInsight }> = ({ insight }) => (
    <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{typeIcons[insight.type]}</span>
                <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: priorityColors[insight.priority],
                    background: `${priorityColors[insight.priority]}20`
                }}>
                    {insight.priority}
                </span>
            </div>
            {insight.change !== undefined && (
                <span style={{
                    color: insight.change >= 0 ? '#22c55e' : '#ef4444',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                }}>
                    {insight.change >= 0 ? '↑' : '↓'} {Math.abs(insight.change)}%
                </span>
            )}
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            {insight.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.5, marginBottom: '1rem' }}>
            {insight.description}
        </p>
        {insight.metric && (
            <div style={{
                padding: '0.75rem',
                background: 'var(--admin-bg)',
                borderRadius: '8px',
                marginBottom: '1rem'
            }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                    {insight.metric}
                </span>
            </div>
        )}
        {insight.actionable && (
            <button className="admin-btn admin-btn-primary" style={{ width: '100%' }}>
                Take Action
            </button>
        )}
    </div>
);

// Prediction Bar
const PredictionBar: React.FC<{ prediction: Prediction }> = ({ prediction }) => {
    const maxValue = Math.max(prediction.current, prediction.predicted) * 1.2;
    const currentWidth = (prediction.current / maxValue) * 100;
    const predictedWidth = (prediction.predicted / maxValue) * 100;

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{prediction.label}</span>
                <span style={{ fontSize: '0.75rem', color: '#666' }}>
                    {prediction.confidence}% confidence
                </span>
            </div>
            <div style={{ position: 'relative', height: '24px', background: 'var(--admin-bg)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute',
                    height: '100%',
                    width: `${currentWidth}%`,
                    background: 'var(--admin-border-color)',
                    borderRadius: '12px'
                }} />
                <div style={{
                    position: 'absolute',
                    height: '100%',
                    width: `${predictedWidth}%`,
                    background: 'linear-gradient(90deg, var(--color-accent), transparent)',
                    borderRadius: '12px',
                    opacity: 0.7
                }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>Current: ${prediction.current.toLocaleString()}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>Predicted: ${prediction.predicted.toLocaleString()}</span>
            </div>
        </div>
    );
};

// Oracle Page
const OraclePage: React.FC = () => {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

    const insights: OracleInsight[] = [
        { id: '1', title: 'Revenue Target at Risk', description: 'Based on current project pace, Q1 revenue target may fall short by 15%. Consider accelerating Bijou Me milestone.', type: 'risk', priority: 'high', metric: '$12,500 gap', change: -15, actionable: true },
        { id: '2', title: 'High-Value Client Opportunity', description: 'Nuestras Casas has shown interest in expanding scope. Historical data suggests 78% conversion likelihood.', type: 'opportunity', priority: 'high', metric: '$25,000 potential', change: 78, actionable: true },
        { id: '3', title: 'Task Completion Trend', description: 'Team productivity has increased 23% this month. Consider taking on additional projects.', type: 'trend', priority: 'medium', change: 23, actionable: false },
        { id: '4', title: 'Invoice Collection Delay', description: 'Average collection time has increased to 45 days. 3 invoices are overdue.', type: 'revenue', priority: 'medium', metric: '$8,200 outstanding', change: -12, actionable: true },
    ];

    const predictions: Prediction[] = [
        { label: 'Q1 Revenue', current: 42500, predicted: 58000, confidence: 85 },
        { label: 'Active Projects (EOQ)', current: 4, predicted: 7, confidence: 72 },
        { label: 'Client Base Growth', current: 12, predicted: 18, confidence: 65 },
    ];

    return (
        <div>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                    }}>
                        🔮
                    </div>
                    <div>
                        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Oracle Engine</h1>
                        <p className="admin-page-subtitle" style={{ marginTop: '0.25rem' }}>AI-powered business intelligence</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['week', 'month', 'quarter'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`admin-btn ${timeRange === range ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Predictions Section */}
            <div className="admin-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>
                    📊 Predictive Analytics
                </h3>
                {predictions.map(pred => (
                    <PredictionBar key={pred.label} prediction={pred} />
                ))}
            </div>

            {/* Insights Grid */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                💡 Key Insights
            </h3>
            <div className="admin-grid admin-grid-2">
                {insights.map(insight => (
                    <InsightCard key={insight.id} insight={insight} />
                ))}
            </div>
        </div>
    );
};

export default OraclePage;
