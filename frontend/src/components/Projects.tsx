import React from 'react';
import { useTranslation } from 'react-i18next';
import ProjectCard from './ProjectCard';
import { usePortfolio } from '../hooks/usePortfolio';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Projects: React.FC = () => {
    const { t } = useTranslation();
    const { projects, loading, error } = usePortfolio();

    // Loading skeleton
    if (loading) {
        return (
            <section id="work" style={{ padding: 'var(--spacing-xl) 0', maxWidth: 'var(--spacing-container)', margin: '0 auto', paddingLeft: 'var(--spacing-lg)', paddingRight: 'var(--spacing-lg)' }}>
                <h2 style={{
                    fontSize: '4rem',
                    marginBottom: 'var(--spacing-xl)',
                    borderBottom: '1px solid #333',
                    paddingBottom: '2rem',
                    textTransform: 'uppercase',
                    fontWeight: 800
                }}>
                    {t('projects.selectedWork')}
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4rem',
                    rowGap: '8rem'
                }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{
                            aspectRatio: '16/10',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '16px',
                            animation: 'pulse 1.5s ease-in-out infinite',
                            marginTop: i % 2 !== 0 ? '150px' : '0'
                        }} />
                    ))}
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section id="work" style={{ padding: 'var(--spacing-xl) 0', maxWidth: 'var(--spacing-container)', margin: '0 auto', paddingLeft: 'var(--spacing-lg)', paddingRight: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '4rem', textTransform: 'uppercase', fontWeight: 800 }}>{t('projects.selectedWork')}</h2>
                <p style={{ color: '#ff5f56', fontSize: '1.2rem' }}>{t('projects.errorLoading')}</p>
            </section>
        );
    }

    return (
        <section id="work" style={{ padding: 'var(--spacing-xl) 0', maxWidth: 'var(--spacing-container)', margin: '0 auto', paddingLeft: 'var(--spacing-lg)', paddingRight: 'var(--spacing-lg)' }}>
            <h2 style={{
                fontSize: '4rem',
                marginBottom: 'var(--spacing-xl)',
                borderBottom: '1px solid #333',
                paddingBottom: '2rem',
                textTransform: 'uppercase',
                fontWeight: 800
            }}>
                {t('projects.selectedWork')}
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4rem',
                rowGap: '8rem',
                marginBottom: 'var(--spacing-xl)'
            }}>
                {projects.slice(0, 4).map((project, index) => (
                    <div key={project.title} style={{ marginTop: index % 2 !== 0 ? '150px' : '0' }}>
                        <ProjectCard project={project} index={index} />
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
                <Link to="/projects" style={{ textDecoration: 'none' }}>
                    <motion.button
                        style={{
                            padding: '1.5rem 3rem',
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            backgroundColor: 'transparent',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                        whileHover={{ scale: 1.05, backgroundColor: '#fff', color: '#000' }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {t('projects.viewAllProjects')}
                        <span>→</span>
                    </motion.button>
                </Link>
            </div>
        </section>
    );
};

export default Projects;

