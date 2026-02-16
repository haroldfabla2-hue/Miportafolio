
import { api } from './api';
import { SimulationScenario, SimulationResult, ResourceForecast } from '../types/oracle';

export const oracleService = {
    runSimulation: async (scenario: SimulationScenario): Promise<{
        results: SimulationResult[],
        resources: ResourceForecast[],
        riskLevel: string,
        prediction: string,
        recommendation: string,
        financialSnapshot: any
    }> => {
        try {
            const response = await api.post('/oracle/simulate', { scenario });
            return response.data;
        } catch (error) {
            console.error('Simulation failed', error);
            throw error;
        }
    },

    askOracle: async (context: string, prompt: string): Promise<string> => {
        try {
            const response = await api.post('/oracle/advisor', { context, prompt });
            return response.data.advice;
        } catch (error) {
            console.error('Oracle advisor failed', error);
            return "The Oracle is currently unreachable.";
        }
    }
};
