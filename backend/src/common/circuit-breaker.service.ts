import { Injectable, Logger } from '@nestjs/common';

export enum CircuitState {
    CLOSED,    // Normal operation
    OPEN,      // Failing, fast-rejecting
    HALF_OPEN  // Testing if recovered
}

export interface CircuitBreakerOptions {
    failureThreshold: number;      // How many failures before opening
    resetTimeout: number;          // How long to stay open (ms)
}

/**
 * Resilient Circuit Breaker Service for external APIs (AI, Payments)
 */
@Injectable()
export class CircuitBreakerService {
    private readonly logger = new Logger(CircuitBreakerService.name);
    
    // State per service identifier
    private states = new Map<string, CircuitState>();
    private failures = new Map<string, number>();
    private nextAttempt = new Map<string, number>();

    async execute<T>(
        serviceName: string, 
        action: () => Promise<T>, 
        fallback: () => Promise<T>,
        options: CircuitBreakerOptions = { failureThreshold: 3, resetTimeout: 30000 }
    ): Promise<T> {
        const state = this.getState(serviceName);

        if (state === CircuitState.OPEN) {
            const now = Date.now();
            if (now > (this.nextAttempt.get(serviceName) || 0)) {
                // Time to test if it recovered
                this.setState(serviceName, CircuitState.HALF_OPEN);
            } else {
                // Still open, fast-fail to fallback
                this.logger.warn(`[CircuitBreaker] ${serviceName} is OPEN. Executing fallback.`);
                return fallback();
            }
        }

        try {
            const result = await action();
            // Success
            this.onSuccess(serviceName);
            return result;
        } catch (error) {
            // Failure
            this.onFailure(serviceName, options);
            this.logger.error(`[CircuitBreaker] ${serviceName} failed: ${error.message}`);
            return fallback();
        }
    }

    private getState(serviceName: string): CircuitState {
        if (!this.states.has(serviceName)) {
            this.states.set(serviceName, CircuitState.CLOSED);
            this.failures.set(serviceName, 0);
        }
        return this.states.get(serviceName)!;
    }

    private setState(serviceName: string, state: CircuitState) {
        this.states.set(serviceName, state);
    }

    private onSuccess(serviceName: string) {
        this.setState(serviceName, CircuitState.CLOSED);
        this.failures.set(serviceName, 0);
    }

    private onFailure(serviceName: string, options: CircuitBreakerOptions) {
        const state = this.getState(serviceName);
        
        if (state === CircuitState.HALF_OPEN) {
            // It failed during testing, immediately reopen
            this.openCircuit(serviceName, options);
            return;
        }

        let fails = (this.failures.get(serviceName) || 0) + 1;
        this.failures.set(serviceName, fails);

        if (fails >= options.failureThreshold) {
            this.openCircuit(serviceName, options);
        }
    }

    private openCircuit(serviceName: string, options: CircuitBreakerOptions) {
        this.setState(serviceName, CircuitState.OPEN);
        this.nextAttempt.set(serviceName, Date.now() + options.resetTimeout);
        this.logger.error(`[CircuitBreaker] 🚨 CIRCUIT TRIPPED for ${serviceName}. Opened for ${options.resetTimeout}ms.`);
    }
}
