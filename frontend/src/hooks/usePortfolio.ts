import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { contentApi, localizeProject, type Project } from '../services/api';
import { projects as staticProjects } from '../data/projects';

interface UsePortfolioResult {
    projects: Project[];
    loading: boolean;
    error: string | null;
}

/**
 * Custom hook to fetch portfolio projects.
 * Uses a HYBRID approach: static hardcoded projects are always shown,
 * CMS portfolio items are merged in when the backend is available.
 * This ensures the public website always displays content.
 */
export function usePortfolio(): UsePortfolioResult {
    const { i18n } = useTranslation();
    const [projects, setProjects] = useState<Project[]>(staticProjects);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchProjects() {
            try {
                setLoading(true);
                setError(null);
                const cmsProjects = await contentApi.getPortfolio();
                if (isMounted) {
                    // Merge: static projects first, then CMS projects (avoiding duplicates by title)
                    const staticTitles = new Set(staticProjects.map(p => p.title.toLowerCase()));
                    const uniqueCmsProjects = cmsProjects.filter(
                        p => !staticTitles.has(p.title.toLowerCase())
                    );
                    setProjects([...staticProjects, ...uniqueCmsProjects]);
                }
            } catch (err) {
                if (isMounted) {
                    // On error, keep static projects (already set as default)
                    setError(null); // Don't show error since static data is available
                    console.warn('CMS fetch failed, using static projects only:', err);
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

    return { projects: localizedProjects, loading, error };
}

export default usePortfolio;
