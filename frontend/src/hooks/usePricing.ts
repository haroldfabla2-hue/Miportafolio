import { useState, useEffect } from 'react';
import { contentApi } from '../services/api';
import { pricingFallback } from '../data/pricing';

export const usePricing = () => {
    const [pricing, setPricing] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        let isTimeout = false;

        const loadPricing = async () => {
            try {
                // Circuit Breaker: 2000ms timeout
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => {
                        isTimeout = true;
                        reject(new Error('TIMEOUT'));
                    }, 2000);
                });

                const fetchPromise = contentApi.getPricing();
                const response = await Promise.race([fetchPromise, timeoutPromise]);

                if (isMounted) {
                    setPricing(response);
                    setIsLoading(false);
                }
            } catch (err: any) {
                if (isMounted) {
                    console.warn(`[usePricing] Using fallback. Reason: ${err.message}`);
                    setPricing(pricingFallback);
                    setError(err.message === 'TIMEOUT' ? 'slow_connection' : 'api_error');
                    setIsLoading(false);
                }
            }
        };

        loadPricing();

        return () => {
            isMounted = false;
        };
    }, []);

    return { pricing, isLoading, error };
};
