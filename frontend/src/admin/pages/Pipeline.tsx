import React, { useState } from 'react';

// Types
interface Lead {
    id: string;
    company: string;
    contactName: string;
    email: string;
    value: number;
    stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
    probability: number;
    source: string;
    nextAction?: string;
    createdAt: string;
}

const stages = [
    { id: 'lead', label: 'New Leads', color: '#888' },
    { id: 'qualified', label: 'Qualified', color: '#3b82f6' },
    { id: 'proposal', label: 'Proposal', color: '#8b5cf6' },
    { id: 'negotiation', label: 'Negotiation', color: '#f59e0b' },
    { id: 'won', label: 'Won', color: '#22c55e' },
];

// Lead Card
const LeadCard: React.FC<{ lead: Lead; onDragStart: (lead: Lead) => void }> = ({ lead, onDragStart }) => (
    <div
        draggable
        onDragStart={() => onDragStart(lead)}
        style={{
            background: 'var(--admin-hover-bg)',
            border: '1px solid var(--admin-border-color)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '0.75rem',
            cursor: 'grab'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{lead.company}</h4>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                ${lead.value.toLocaleString()}
            </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>{lead.contactName}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.65rem',
                background: 'var(--admin-bg)',
                color: '#888'
            }}>
                {lead.source}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#666' }}>
                {lead.probability}% prob
            </span>
        </div>
    </div>
);

// Pipeline Column
const PipelineColumn: React.FC<{
    stage: typeof stages[0];
    leads: Lead[];
    totalValue: number;
    onDrop: (stageId: string) => void;
    onDragStart: (lead: Lead) => void;
}> = ({ stage, leads, totalValue, onDrop, onDragStart }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={() => { onDrop(stage.id); setIsDragOver(false); }}
            style={{
                flex: 1,
                minWidth: '240px',
                background: isDragOver ? 'rgba(163, 255, 0, 0.05)' : 'var(--admin-card-bg)',
                border: `1px solid ${isDragOver ? 'var(--color-accent)' : 'var(--admin-border-color)'}`,
                borderRadius: '16px',
                padding: '1rem',
                transition: 'all 0.2s'
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--admin-border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: stage.color }} />
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{stage.label}</span>
                    <span style={{
                        marginLeft: 'auto',
                        background: 'var(--admin-hover-bg)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        color: '#888'
                    }}>
                        {leads.length}
                    </span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                    ${totalValue.toLocaleString()}
                </span>
            </div>

            {/* Leads */}
            <div style={{ minHeight: '200px' }}>
                {leads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onDragStart={onDragStart} />
                ))}
            </div>
        </div>
    );
};

// Main Pipeline Page
const PipelinePage: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [draggingLead, setDraggingLead] = useState<Lead | null>(null);

    // Demo data
    const demoLeads: Lead[] = [
        { id: '1', company: 'TechStart Inc', contactName: 'María González', email: 'maria@techstart.com', value: 15000, stage: 'lead', probability: 20, source: 'Website', createdAt: '2024-01-17' },
        { id: '2', company: 'Green Energy Co', contactName: 'Carlos Ruiz', email: 'carlos@greenenergy.com', value: 45000, stage: 'qualified', probability: 40, source: 'Referral', createdAt: '2024-01-15' },
        { id: '3', company: 'Fashion Hub', contactName: 'Ana López', email: 'ana@fashionhub.com', value: 25000, stage: 'proposal', probability: 60, source: 'LinkedIn', createdAt: '2024-01-10' },
        { id: '4', company: 'DataDrive', contactName: 'Pedro Sánchez', email: 'pedro@datadrive.io', value: 80000, stage: 'negotiation', probability: 75, source: 'Conference', createdAt: '2024-01-05' },
        { id: '5', company: 'CloudMax', contactName: 'Laura Torres', email: 'laura@cloudmax.com', value: 35000, stage: 'won', probability: 100, source: 'Cold Email', createdAt: '2024-01-02' },
        { id: '6', company: 'Smart Retail', contactName: 'Miguel Díaz', email: 'miguel@smartretail.com', value: 20000, stage: 'lead', probability: 15, source: 'Website', createdAt: '2024-01-16' },
        { id: '7', company: 'HealthPlus', contactName: 'Sofía Martín', email: 'sofia@healthplus.org', value: 55000, stage: 'qualified', probability: 45, source: 'Partner', createdAt: '2024-01-12' },
    ];

    const displayLeads = leads.length > 0 ? leads : demoLeads;

    const handleDrop = (stageId: string) => {
        if (!draggingLead || draggingLead.stage === stageId) return;

        const newProbability = stages.findIndex(s => s.id === stageId) * 20 + 20;
        const updatedLeads = displayLeads.map(l =>
            l.id === draggingLead.id ? { ...l, stage: stageId as Lead['stage'], probability: Math.min(newProbability, 100) } : l
        );
        setLeads(updatedLeads);
        setDraggingLead(null);
    };

    const getLeadsByStage = (stageId: string) => displayLeads.filter(l => l.stage === stageId);
    const getStageTotalValue = (stageId: string) => getLeadsByStage(stageId).reduce((sum, l) => sum + l.value, 0);
    const totalPipelineValue = displayLeads.filter(l => l.stage !== 'lost').reduce((sum, l) => sum + l.value, 0);
    const weightedValue = displayLeads.filter(l => l.stage !== 'lost').reduce((sum, l) => sum + (l.value * l.probability / 100), 0);

    return (
        <div>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="admin-page-title">Sales Pipeline</h1>
                    <p className="admin-page-subtitle">Track and manage your leads through the sales funnel.</p>
                </div>
                <button className="admin-btn admin-btn-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Lead
                </button>
            </div>

            {/* Stats */}
            <div className="admin-grid admin-grid-3" style={{ marginBottom: '2rem' }}>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Total Pipeline</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>${totalPipelineValue.toLocaleString()}</p>
                </div>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Weighted Value</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-accent)' }}>${Math.round(weightedValue).toLocaleString()}</p>
                </div>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Active Deals</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>{displayLeads.filter(l => l.stage !== 'won' && l.stage !== 'lost').length}</p>
                </div>
            </div>

            {/* Pipeline Board */}
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                {stages.map(stage => (
                    <PipelineColumn
                        key={stage.id}
                        stage={stage}
                        leads={getLeadsByStage(stage.id)}
                        totalValue={getStageTotalValue(stage.id)}
                        onDrop={handleDrop}
                        onDragStart={setDraggingLead}
                    />
                ))}
            </div>
        </div>
    );
};

export default PipelinePage;
