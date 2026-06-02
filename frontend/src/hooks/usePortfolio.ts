import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { contentApi, localizeProject, type Project } from '../services/api';
import { projects as fallbackCache } from '../data/projects';

interface UsePortfolioResult {
    projects: Project[];
    loading: boolean;
    error: string | null;
    isFallback: boolean;
}

/**
 * Custom hook to fetch portfolio projects with Enterprise-grade Zero-Downtime Pipeline.
 * Attempts to fetch from the CMS API with a 2000ms timeout (Circuit Breaker).
 * If it fails, falls back to the in-memory cache to guarantee High Availability.
 */
export function usePortfolio(): UsePortfolioResult {
    const { i18n } = useTranslation();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFallback, setIsFallback] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function fetchProjects() {
            try {
                setLoading(true);
                setError(null);
                setIsFallback(false);

                // Enterprise Practice: Circuit Breaker with 2000ms Timeout
                const fetchPromise = contentApi.getPortfolio();
                const timeoutPromise = new Promise<Project[]>((_, reject) =>
                    setTimeout(() => reject(new Error('API Timeout')), 2000)
                );

                const cmsProjects = await Promise.race([fetchPromise, timeoutPromise]);
                
                if (isMounted) {
                    if (cmsProjects && cmsProjects.length > 0) {
                        setProjects(cmsProjects);
                    } else {
                        // Empty response (backend up but no data)
                        setProjects([]);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    console.warn('[Enterprise Fallback] CMS fetch failed or timed out. Serving emergency cache.', err);
                    setProjects(fallbackCache);
                    setIsFallback(true);
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

    const localizedProjects = useMemo(
        () => projects.map((project) => localizeProject(project, i18n.language)),
        [projects, i18n.language]
    );

    return { projects: localizedProjects, loading, error, isFallback };
}

export default usePortfolio;
