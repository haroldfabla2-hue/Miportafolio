import React from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../hooks/usePortfolio';
import ProjectCard from './ProjectCard';

const ProjectsPage: React.FC = () => {
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
                    <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '2rem' }}>ALL PROJECTS</h1>
                    <p style={{ color: '#ff5f56', fontSize: '1.2rem' }}>Unable to load projects. Please try again later.</p>
                </section>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '150px', minHeight: '100vh', paddingBottom: '100px' }}>
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
                    ALL PROJECTS
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ fontSize: '1.5rem', color: '#999', maxWidth: '600px' }}
                >
                    A curated selection of digital experiences, websites, and brand identities crafted with precision and passion.
                </motion.p>
            </section>

            {/* Projects List */}
            <section style={{
                padding: '0 var(--spacing-lg)',
                maxWidth: 'var(--spacing-container)',
                margin: '0 auto'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '150px' }}>
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.title}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.8 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: index % 2 === 0 ? '1fr 1.5fr' : '1.5fr 1fr',
                                gap: '4rem',
                                alignItems: 'center',
                                direction: index % 2 === 0 ? 'ltr' : 'rtl'
                            }}
                        >
                            {/* Text Content */}
                            <div style={{ direction: 'ltr', textAlign: 'left' }}>
                                <div style={{
                                    borderBottom: '1px solid #333',
                                    paddingBottom: '20px',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline'
                                }}>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>{project.title}</h2>
                                    <span style={{ fontSize: '1rem', color: '#666', fontFamily: 'monospace' }}>{project.year}</span>
                                </div>

                                <p style={{
                                    fontSize: '1.2rem',
                                    color: '#ccc',
                                    lineHeight: 1.6,
                                    marginBottom: '30px',
                                    fontWeight: 300
                                }}>
                                    {project.description}
                                </p>

                                <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
                                    {project.services.map(service => (
                                        <span key={service} style={{
                                            border: '1px solid #333',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem',
                                            color: '#888'
                                        }}>
                                            {service}
                                        </span>
                                    ))}
                                </div>

                                <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>
                                    ROLE: <span style={{ color: '#fff' }}>{project.role}</span>
                                </div>
                            </div>

                            {/* Enhanced Preview Card */}
                            <div style={{ direction: 'ltr' }}>
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

