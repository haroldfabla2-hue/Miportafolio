import { useMemo } from 'react';
import { Project, Task, Asset, AssetStatus, TaskStatus, User, UserRole, Client } from '../types/models';
import { DashboardFilter } from '../types/analytics';

export const useDashboardAnalytics = (
    projects: Project[],
    tasks: Task[],
    assets: Asset[],
    users: User[],
    clients: Client[],
    filters: DashboardFilter,
    nlQuery: string
) => {
    return useMemo(() => {
        // Filter Data
        let activeP = projects;
        let activeT = tasks;

        if (nlQuery) {
            const lowerQ = nlQuery.toLowerCase();
            activeP = activeP.filter(p => (p.name || '').toLowerCase().includes(lowerQ) || (p.description || '').toLowerCase().includes(lowerQ));
            activeT = activeT.filter(t => (t.title || '').toLowerCase().includes(lowerQ));
        }
        if (filters.assigneeId) activeT = activeT.filter(t => t.assignee === filters.assigneeId);
        if (filters.projectId) {
            activeP = activeP.filter(p => p.id === filters.projectId);
            activeT = activeT.filter(t => t.projectId === filters.projectId);
        }

        // KPIs
        const totalBudget = activeP.reduce((acc, p) => acc + (p.budget || 0), 0);
        const totalSpent = activeP.reduce((acc, p) => acc + (p.spent || 0), 0);
        const globalMargin = totalBudget > 0 ? ((totalBudget - totalSpent) / totalBudget) * 100 : 0;

        const activeLoad = activeT.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
        const reviewQueue = assets.filter(a => a.status === AssetStatus.PENDING_REVIEW).length;

        // Team Performance
        const teamStats = users
            .filter(u => u.role === UserRole.WORKER)
            .map(u => {
                const userTasks = activeT.filter(t => t.assignee === u.id);
                const completed = userTasks.filter(t => t.status === TaskStatus.DONE).length;
                const inProgress = userTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
                const efficiency = userTasks.length > 0 ? Math.round((completed / userTasks.length) * 100) : 0;
                return {
                    id: u.id,
                    name: u.name,
                    avatar: u.avatar,
                    total: userTasks.length,
                    completed,
                    inProgress,
                    efficiency,
                    workload: inProgress
                };
            })
            .sort((a, b) => b.efficiency - a.efficiency);

        // Risk Matrix
        const riskMatrix = activeP.map(p => {
            const startDate = new Date(p.startDate).getTime();
            const endDate = p.endDate ? new Date(p.endDate).getTime() : new Date().getTime();
            const now = new Date().getTime();
            const totalDuration = endDate - startDate;
            const elapsed = totalDuration > 0 ? Math.max(0, Math.min(1, (now - startDate) / totalDuration)) : 0;
            const burn = p.budget > 0 ? (p.spent || 0) / p.budget : 0;

            return {
                id: p.id,
                name: p.name,
                x: Math.round(elapsed * 100),
                y: Math.round(burn * 100),
                z: p.budget,
                status: p.status,
                payload: p // Store full project for click handler
            };
        });

        // Financial Trend (Mocked for now, but structure ready for real data)
        const financialTrend = activeP.map(p => ({
            name: p.name,
            budget: p.budget,
            spent: p.spent || 0
        })).sort((a, b) => b.budget - a.budget).slice(0, 5);

        // --- USER REQUESTED BI METRICS ---

        // 1. Revenue Mix (by Project Type)
        const revenueMap = new Map<string, number>();
        activeP.forEach(p => {
            const type = p.type || 'OTHER';
            revenueMap.set(type, (revenueMap.get(type) || 0) + p.budget);
        });
        const revenueMix = Array.from(revenueMap.entries())
            .map(([name, value]) => ({ name: name.replace('_', ' '), value }))
            .sort((a, b) => b.value - a.value);

        // 2. Client Pipeline (by Status)
        const pipelineMap = new Map<string, number>();
        // Default buckets
        pipelineMap.set('LEAD', 0);
        pipelineMap.set('ACTIVE', 0);
        pipelineMap.set('CHURNED', 0);

        clients.forEach(c => {
            // Normalize status to uppercase just in case
            const status = c.status ? c.status.toUpperCase() : 'ACTIVE';
            const key = status === 'Active' ? 'ACTIVE' : status; // Handle simple case diffs if any
            pipelineMap.set(key, (pipelineMap.get(key) || 0) + 1);
        });

        const clientPipeline = Array.from(pipelineMap.entries())
            .map(([name, value]) => ({ name, value }));

        return {
            totalBudget, totalSpent, globalMargin, activeLoad, reviewQueue,
            teamStats, riskMatrix, financialTrend, revenueMix, clientPipeline
        };
    }, [projects, tasks, assets, users, clients, nlQuery, filters]);
};
