
export interface PredictiveInsight {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    prediction: string;
    recommendation: string;
    impactedProjects: string[];
}

export type DashboardFilter = {
    projectId?: string;
    assigneeId?: string;
    status?: string;
    priority?: string;
    query?: string;
};
