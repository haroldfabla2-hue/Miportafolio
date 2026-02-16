
// --- ORACLE SIMULATION ENGINE ---

export interface SimulationScenario {
    id: string;
    name: string;
    hiringPlan: Record<string, number>; // e.g. { 'Junior Dev': 2, 'Senior Designer': 1 }
    clientChurnRate: number; // % chance of losing clients
    newClientGrowth: number; // % growth of new business
    marketCondition: 'BOOM' | 'STABLE' | 'RECESSION';
    expenseMultiplier: number; // 1.0 = normal, 1.2 = 20% increase
}

export interface SimulationResult {
    month: string;
    baseline: {
        revenue: number;
        expenses: number;
        cashReserve: number;
    };
    scenario: {
        revenue: number;
        expenses: number;
        cashReserve: number;
    };
    teamUtilization: number;
    riskScore: number;
}

export interface ResourceForecast {
    userId: string;
    userName: string;
    burnoutRisk: number; // 0-100
    monthsUntilBurnout: number;
    utilizationTrend: 'UP' | 'DOWN' | 'STABLE';
}
