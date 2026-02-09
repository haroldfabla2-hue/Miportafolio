import { useState, useEffect } from 'react';
import { contentApi, type Project } from '../services/api';

interface UsePortfolioResult {
    projects: Project[];
    loading: boolean;
    error: string | null;
}

/**
 * Custom hook to fetch portfolio projects from the CMS API.
 * Includes loading state, error handling, and automatic data transformation.
 */
export function usePortfolio(): UsePortfolioResult {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchProjects() {
            try {
                setLoading(true);
                setError(null);
                const data = await contentApi.getPortfolio();
                if (isMounted) {
                    setProjects(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch projects');
                    console.error('Portfolio fetch error:', err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchProjects();

        return () => {
            isMounted = false;
        };
    }, []);

    return { projects, loading, error };
}

export default usePortfolio;
