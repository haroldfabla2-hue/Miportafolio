import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SEO from './SEO';
import { usePortfolio } from '../hooks/usePortfolio';
import ProjectCard from './ProjectCard';

const ProjectsPage: React.FC = () => {
    const { t } = useTranslation();
    const { projects, loading, error } = usePortfolio();

    // Loading skeleton for page
    if (loading) {
        return (
            <div style={{ paddingTop: '150px', minHeight: '100vh', paddingBottom: '100px' }}>
                <section style={{
                    padding: '0 var(--spacing-lg)',
                    maxWidth: 'var(--spacing-container)',
                    margin: '0 auto 100px auto',
                    borderBottom: '1px solid #333',
                    paddingBottom: '50px'
                }}>
                    <div style={{
                        width: '60%',
                        height: '6rem',
                        backgroundColor: '#1a1a1a',
                        borderRadius: '8px',
                        marginBottom: '30px',
                        animation: 'pulse 1.5s ease-in-out infinite'
                    }} />
                    <div style={{
                        width: '40%',
                        height: '1.5rem',
                        backgroundColor: '#1a1a1a',
                        borderRadius: '4px',
                        animation: 'pulse 1.5s ease-in-out infinite'
                    }} />
                </section>
                <section style={{
                    padding: '0 var(--spacing-lg)',
                    maxWidth: 'var(--spacing-container)',
                    margin: '0 auto'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '150px' }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1.5fr',
                                gap: '4rem',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    height: '200px',
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '16px',
                                    animation: 'pulse 1.5s ease-in-out infinite'
                                }} />
                                <div style={{
                                    aspectRatio: '16/10',
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '16px',
                                    animation: 'pulse 1.5s ease-in-out infinite'
                                }} />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{ paddingTop: '150px', minHeight: '100vh', paddingBottom: '100px' }}>
                <section style={{
                    padding: '0 var(--spacing-lg)',
                    maxWidth: 'var(--spacing-container)',
                    margin: '0 auto'
                }}>
                    <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '2rem' }}>{t('projects.heroTitle')}</h1>
                    <p style={{ color: '#ff5f56', fontSize: '1.2rem' }}>{t('projects.errorLoading')}</p>
                </section>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '150px', minHeight: '100vh', paddingBottom: '100px' }}>
            <SEO title="Our Works" description="Explore our portfolio of curated digital experiences and brand identities." />
            {/* Hero Section */}
            <section style={{
                padding: '0 var(--spacing-lg)',
                maxWidth: 'var(--spacing-container)',
                margin: '0 auto 100px auto',
                borderBottom: '1px solid #333',
                paddingBottom: '50px'
            }}>
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{
                        fontSize: 'clamp(3rem, 8vw, 6rem)',
                        fontWeight: 900,
                        lineHeight: 0.9,
                        letterSpacing: '-0.02em',
                        marginBottom: '30px'
                    }}
                >
                    {t('projects.heroTitle')}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ fontSize: '1.5rem', color: '#999', maxWidth: '600px' }}
                >
                    {t('projects.heroSubtitle')}
                </motion.p>
            </section>

            {/* Projects List */}
            <section style={{
                padding: '0 var(--spacing-lg)',
                maxWidth: 'var(--spacing-container)',
                margin: '0 auto'
            }}>
                <div className="projects-container" style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.title}
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 1, type: "spring", bounce: 0.2 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                                gap: '4rem',
                                alignItems: 'center',
                                backgroundColor: 'rgba(20,20,20,0.6)',
                                padding: 'clamp(2rem, 5vw, 4rem)',
                                borderRadius: '40px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(20px)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Ambient Glow */}
                            <div style={{
                                position: 'absolute',
                                top: index % 2 === 0 ? '-20%' : 'auto',
                                bottom: index % 2 !== 0 ? '-20%' : 'auto',
                                left: index % 2 === 0 ? '-10%' : 'auto',
                                right: index % 2 !== 0 ? '-10%' : 'auto',
                                width: '50%',
                                height: '50%',
                                background: 'radial-gradient(circle, rgba(163, 255, 0, 0.1) 0%, transparent 70%)',
                                filter: 'blur(60px)',
                                zIndex: 0,
                                pointerEvents: 'none'
                            }} />

                            {/* Text Content */}
                            <div className="project-text" style={{ 
                                direction: 'ltr', 
                                textAlign: 'left', 
                                zIndex: 1,
                                order: index % 2 === 0 ? 1 : 2
                            }}>
                                <div style={{
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                    paddingBottom: '20px',
                                    marginBottom: '30px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem'
                                }}>
                                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>{project.title}</h2>
                                    <span style={{ fontSize: '1.2rem', color: 'var(--color-accent)', fontFamily: 'monospace' }}>{project.year}</span>
                                </div>

                                <p className="description" style={{
                                    fontSize: '1.2rem',
                                    color: '#ccc',
                                    lineHeight: 1.6,
                                    marginBottom: '40px',
                                    fontWeight: 300
                                }}>
                                    {project.description}
                                </p>

                                <div className="project-services" style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
                                    {project.services.map(service => (
                                        <span key={service} style={{
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            padding: '8px 20px',
                                            borderRadius: '30px',
                                            fontSize: '0.9rem',
                                            color: '#fff',
                                            backdropFilter: 'blur(5px)'
                                        }}>
                                            {service}
                                        </span>
                                    ))}
                                </div>

                                <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>
                                    {t('common.role')}: <span style={{ color: '#fff' }}>{project.role}</span>
                                </div>
                            </div>

                            {/* Enhanced Preview Card */}
                            <div style={{ direction: 'ltr', zIndex: 1, order: index % 2 === 0 ? 2 : 1 }}>
                                <ProjectCard project={project} index={index} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProjectsPage;

