
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IrisService } from '../iris/iris.service';

interface SimulationScenario {
    id: string;
    name: string;
    hiringPlan: Record<string, number>;
    clientChurnRate: number;
    newClientGrowth: number;
    marketCondition: 'BOOM' | 'STABLE' | 'RECESSION';
    expenseMultiplier: number;
}

@Injectable()
export class OracleService {
    private readonly logger = new Logger(OracleService.name);

    constructor(
        private prisma: PrismaService,
        private irisService: IrisService
    ) { }

    async runSimulation(scenario: SimulationScenario, userRole: string) {
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            throw new Error('Only admins can run financial simulations');
        }

        // ==========================================
        // PHASE 1: FETCH ALL REAL FINANCIAL DATA
        // ==========================================

        // A. Team Data
        const workers = await this.prisma.user.findMany({ where: { role: 'WORKER' } });

        // B. Projects
        const projects = await this.prisma.project.findMany({
            where: { status: { in: ['ACTIVE', 'PLANNING'] } },
            include: { timeLogs: { include: { user: true } } }
        });

        // C. Leads
        const leads = await this.prisma.client.findMany({ where: { status: 'LEAD' } }); // Enums are uppercase usually, verify schema
        const pipelineValue = leads.reduce((sum, c) => sum + (c.budgetAllocated || 0), 0);
        const weightedPipelineRevenue = pipelineValue * 0.3;

        // D. Accounts Receivable
        const invoices = await this.prisma.invoice.findMany({
            where: { status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] } }
        });
        const totalAR = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

        // E. Accounts Payable
        const bills = await this.prisma.bill.findMany({
            where: { status: 'PENDING' } // Schema says PENDING for bills
        });
        const totalAP = bills.reduce((sum, bill) => sum + (bill.total || 0), 0);

        // F. Retainers
        const retainers = await this.prisma.retainerAgreement.findMany({
            where: { status: 'ACTIVE' }
        });
        const monthlyRetainerRevenue = retainers.reduce((sum, r) => {
            const factor = r.interval === 'QUARTERLY' ? 1 / 3 : r.interval === 'YEARLY' ? 1 / 12 : 1;
            return sum + (r.amount * factor);
        }, 0);

        // G. Recurring Expenses
        const recurringExpenses = await this.prisma.recurringExpense.findMany({
            where: { active: true }
        });
        const monthlyRecurringCosts = recurringExpenses.reduce((sum, r) => {
            const factor = r.interval === 'YEARLY' ? 1 / 12 : r.interval === 'WEEKLY' ? 4 : 1;
            return sum + (r.amount * factor);
        }, 0);

        // H. System Settings (Cash)
        const systemSetting = await this.prisma.systemSetting.findUnique({ where: { key: 'FINANCIAL_CONFIG' } });
        const financialConfig = systemSetting ? JSON.parse(systemSetting.value) : {};
        const startCash = financialConfig.cashOnHand || 50000;

        // ==========================================
        // PHASE 2: CALCULATE REAL COSTS
        // ==========================================

        const fixedPayroll = workers.reduce((acc, u) => acc + (u.monthlySalary || 0), 0);
        const hourlyPayrollEstimate = workers
            .filter(u => !u.monthlySalary && u.hourlyRate)
            .reduce((acc, u) => acc + ((u.hourlyRate || 0) * 160), 0);
        const currentPayroll = fixedPayroll + hourlyPayrollEstimate;

        const realMonthlyBurn = currentPayroll + monthlyRecurringCosts;

        // Dynamic Hiring Costs
        const avgHourlyRate = workers.reduce((sum, w) => sum + (w.hourlyRate || 0), 0) / (workers.length || 1);
        const calibrationBase = (avgHourlyRate || 50) * 160;

        const roleCosts: Record<string, number> = {
            'Junior': Math.round(calibrationBase * 0.7),
            'Mid': Math.round(calibrationBase * 1.0),
            'Senior': Math.round(calibrationBase * 1.5),
            'Director': Math.round(calibrationBase * 2.5)
        };

        const calculateNewHiresCost = (plan: Record<string, number> = {}) => {
            return Object.entries(plan).reduce((acc, [role, count]) => {
                const cost = Object.entries(roleCosts).find(([r]) => role.includes(r))?.[1] || 5000;
                return acc + (cost * count);
            }, 0);
        };

        const newHiresCost = calculateNewHiresCost(scenario.hiringPlan);

        // ==========================================
        // PHASE 3: 12-MONTH SIMULATION
        // ==========================================

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const results = [];
        let runningCashBaseline = startCash;
        let runningCashScenario = startCash;

        // Find avg monthly income from completed transactions (last 3 months)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const historicalTransactions = await this.prisma.transaction.findMany({
            where: { date: { gte: threeMonthsAgo }, status: 'COMPLETED' }
        });
        const inputs = historicalTransactions.filter(t => t.type === 'INCOME');
        const avgMonthlyIncome = inputs.length > 0
            ? inputs.reduce((sum, t) => sum + t.amount, 0) / 3
            : 0;

        for (let i = 0; i < 12; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() + i + 1);
            const monthName = months[d.getMonth()];
            const marketFactor = scenario.marketCondition === 'BOOM' ? 1.2 : scenario.marketCondition === 'RECESSION' ? 0.8 : 1.0;

            // --- REVENUE ---
            // 1. Retainer
            const retainerRev = monthlyRetainerRevenue;

            // 2. Project Revenue (Prorated)
            let projectRevenueReal = 0;
            // Simplified logic: assume projects last 3 months if no end date
            // In a real port, we'd iterate projects. For now, estimate based on active projects budget
            projects.forEach(p => {
                // Simplified: budget / 3 months distributed
                // Real logic from controller was: check dates. 
                // Let's assume standard distribution for stability in this V1 port
                // or use avgMonthlyIncome as baseline proxy
            });
            // Better: use avgMonthlyIncome as the "Project Revenue" proxy for baseline
            projectRevenueReal = avgMonthlyIncome;

            // 3. AR Collection (Spread first 3 months)
            const collectionRate = 0.8;
            const arCollection = i < 3 ? (totalAR * collectionRate) / 3 : 0;

            // 4. Pipeline
            const pipelineInjection = i < 6 ? (weightedPipelineRevenue / 6) : 0;

            // --- BASELINE ---
            const baselineRevenue = retainerRev + projectRevenueReal;
            const baselineBurn = realMonthlyBurn;
            const baselineProfit = baselineRevenue - baselineBurn;
            runningCashBaseline += baselineProfit;

            // --- SCENARIO ---
            const netGrowthPercent = (scenario.newClientGrowth - scenario.clientChurnRate) / 100;
            const organicGrowth = projectRevenueReal * (netGrowthPercent * (i + 1));

            const scenarioRevenue = (retainerRev + projectRevenueReal + arCollection + pipelineInjection + organicGrowth) * marketFactor;

            // AP Payment (Spread first 2 months)
            const apPayment = i < 2 ? (totalAP / 2) : 0;

            const scenarioBurn = (realMonthlyBurn + newHiresCost) * (scenario.expenseMultiplier || 1);
            const scenarioProfit = scenarioRevenue - scenarioBurn - apPayment;
            runningCashScenario += scenarioProfit;

            // --- RISK ---
            let risk = 0;
            if (runningCashScenario < scenarioBurn * 2) risk += 40;
            if (runningCashScenario < 0) risk += 40;
            if (scenario.marketCondition === 'RECESSION') risk += 20;

            // Team Utilization Estimate
            const totalStaff = workers.length + Object.values(scenario.hiringPlan || {}).reduce((a, b) => a + b, 0);
            const capacity = totalStaff * 8000; // $ output per person
            const utilization = Math.min(100, Math.round((scenarioRevenue / Math.max(1, capacity)) * 100));
            if (utilization > 95) risk += 30;

            results.push({
                month: monthName,
                baseline: {
                    revenue: Math.round(baselineRevenue),
                    expenses: Math.round(baselineBurn),
                    cashReserve: Math.round(runningCashBaseline)
                },
                scenario: {
                    revenue: Math.round(scenarioRevenue),
                    expenses: Math.round(scenarioBurn + apPayment),
                    cashReserve: Math.round(runningCashScenario)
                },
                teamUtilization: utilization,
                riskScore: Math.min(100, risk),
                arCollected: Math.round(arCollection),
                apPaid: Math.round(apPayment)
            });
        }

        // ==========================================
        // PHASE 4: INSIGHTS
        // ==========================================

        const finalResult = results[11];
        let riskLevel = 'LOW';
        if (finalResult.riskScore > 40) riskLevel = 'MEDIUM';
        if (finalResult.riskScore > 70) riskLevel = 'HIGH';
        if (finalResult.riskScore > 90) riskLevel = 'CRITICAL';

        let prediction = `Scenario ends with $${finalResult.scenario.cashReserve.toLocaleString()} cash. `;
        if (results.some(r => r.scenario.cashReserve < 0)) {
            prediction = "CRITICAL: Cash flow goes negative during simulation.";
            riskLevel = 'CRITICAL';
        }

        // Fetch Task load for burnout risk
        const tasks = await this.prisma.task.findMany({
            where: { status: { not: 'COMPLETED' } },
            select: { assignedToId: true }
        });

        const resources = workers.map(u => {
            const assignedTasks = tasks.filter(t => t.assignedToId === u.id).length;
            // Simplified risk: > 5 tasks is high risk
            const riskValue = Math.min(100, (assignedTasks / 8) * 100);

            return {
                userId: u.id,
                userName: u.name,
                burnoutRisk: Math.round(riskValue),
                monthsUntilBurnout: riskValue > 80 ? 2 : riskValue > 50 ? 6 : 12,
                utilizationTrend: assignedTasks > 3 ? 'INCREASING' : 'STABLE'
            };
        });

        return {
            results,
            resources,
            riskLevel,
            prediction,
            recommendation: finalResult.scenario.cashReserve > finalResult.baseline.cashReserve
                ? "Strategy improves cash position."
                : "Strategy consumes more cash than baseline.",
            financialSnapshot: {
                startingCash: startCash,
                monthlyRetainers: Math.round(monthlyRetainerRevenue),
                monthlyRecurringCosts: Math.round(monthlyRecurringCosts),
                monthlyPayroll: Math.round(currentPayroll),
                totalBurn: Math.round(realMonthlyBurn),
                outstandingAR: Math.round(totalAR),
                outstandingAP: Math.round(totalAP),
                pipelineValue: Math.round(pipelineValue)
            }
        };
    }

    async getDashboardData(userRole: string) {
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            throw new Error('Unauthorized');
        }

        // Aggregate Financial Items
        const retainers = await this.prisma.retainerAgreement.findMany({ where: { status: 'ACTIVE' } });
        const monthlyRetainerRevenue = retainers.reduce((sum, r) => {
            const factor = r.interval === 'QUARTERLY' ? 1 / 3 : r.interval === 'YEARLY' ? 1 / 12 : 1;
            return sum + (r.amount * factor);
        }, 0);

        const recurringExpenses = await this.prisma.recurringExpense.findMany({ where: { active: true } });
        const monthlyRecurringCosts = recurringExpenses.reduce((sum, r) => {
            const factor = r.interval === 'YEARLY' ? 1 / 12 : r.interval === 'WEEKLY' ? 4 : 1;
            return sum + (r.amount * factor);
        }, 0);

        const projectStats = await this.prisma.project.groupBy({
            by: ['status'],
            _count: true,
            _sum: { budget: true }
        });

        const taskStats = await this.prisma.task.groupBy({
            by: ['status'],
            _count: true
        });

        const systemSetting = await this.prisma.systemSetting.findUnique({ where: { key: 'FINANCIAL_CONFIG' } });
        const financialConfig = systemSetting ? JSON.parse(systemSetting.value) : {};
        const cashOnHand = financialConfig.cashOnHand || 50000;

        return {
            financials: {
                cashOnHand,
                monthlyRetainerRevenue: Math.round(monthlyRetainerRevenue),
                monthlyBurnRate: Math.round(monthlyRecurringCosts)
            },
            projects: projectStats,
            tasks: taskStats
        };
    }

    async askOracle(context: string, prompt: string, userRole: string) {
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            throw new Error('Unauthorized');
        }

        // Use Iris Service for the logic
        // We construct a specific prompt for the "Oracle" persona
        const oraclePrompt = `
        ACT AS: The Strategic Oracle (CFO/COO AI).
        CONTEXT: ${context}
        USER QUESTION: ${prompt}
        
        TASK: analyze the financial data and provide strategic advice.
        `;

        const response = await this.irisService.chat(oraclePrompt);
        return { advice: response.response };
    }
}
