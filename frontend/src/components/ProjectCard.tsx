import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Project } from '../services/api';
import MagneticButton from './MagneticButton';

interface ProjectCardProps {
    project: Project;
    index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
    const isInternal = project.url.startsWith('/');
    const isGithub = project.url.includes('github.com');
    const showImage = isInternal || isGithub || (project.image && project.image !== '/projects/placeholder.png' && project.image !== '/projects/github-repo.svg');

    return (
        <motion.div
            style={{
                display: 'block',
                position: 'relative'
            }}
            whileHover="hover"
        >
            {/* Header (Project Info) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                {isInternal ? (
                    <Link to={project.url} style={{ textDecoration: 'none', color: '#fff' }}>
                        <motion.h3 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <motion.span
                                variants={{ hover: { x: 10, color: '#fff' } }}
                                style={{ color: 'var(--color-accent)', fontSize: '1.2rem', transition: 'color 0.3s' }}
                            >
                                ➔
                            </motion.span>
                            {project.title}
                        </motion.h3>
                    </Link>
                ) : (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#fff' }}>
                        <motion.h3 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <motion.span
                                variants={{ hover: { x: 10, color: '#fff' } }}
                                style={{ color: 'var(--color-accent)', fontSize: '1.2rem', transition: 'color 0.3s' }}
                            >
                                ➔
                            </motion.span>
                            {project.title}
                        </motion.h3>
                    </a>
                )}
            </div>

            {/* Browser Window Frame */}
            <motion.div
                className="window-frame"
                variants={{ 
                    hover: { 
                        scale: 0.98,
                        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.8)'
                    } 
                }}
                transition={{ duration: 0.5, type: 'spring' }}
                style={{
                    backgroundColor: '#1a1a1a', 
                    borderRadius: '16px',
                    overflow: 'hidden',
                    aspectRatio: '16/10',
                    position: 'relative',
                    border: '1px solid #333',
                    transformOrigin: 'center'
                }}
            >
                {/* Window Controls */}
                <div style={{
                    height: '32px',
                    backgroundColor: '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1rem',
                    gap: '6px',
                    borderBottom: '1px solid #333'
                }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }} />

                    {/* Reload Button */}
                    {!showImage && (
                        <div
                            title="Reload Preview"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                const parent = e.currentTarget.closest('.window-frame');
                                const iframe = parent?.querySelector('iframe');
                                if (iframe) {
                                    const currentSrc = iframe.src;
                                    iframe.src = '';
                                    setTimeout(() => { iframe.src = currentSrc; }, 10);
                                }
                            }}
                            style={{
                                marginLeft: 'auto',
                                cursor: 'pointer',
                                color: '#666',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 4v6h-6"></path>
                                <path d="M1 20v-6h6"></path>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                        </div>
                    )}
                </div>

                {/* Live Website Preview or Mock Image */}
                <div
                    style={{
                        height: 'calc(100% - 32px)',
                        backgroundColor: '#111',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {showImage ? (
                        <img
                            src={project.image}
                            alt={project.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '200%',
                            height: '200%',
                            transform: 'scale(0.5)',
                            transformOrigin: 'top left',
                        }}>
                            <iframe
                                src={project.url}
                                title={`Preview of ${project.title}`}
                                loading="lazy"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    pointerEvents: 'auto',
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Magnetic Live Preview Badge */}
            {isInternal ? (
                <Link to={project.url} style={{ textDecoration: 'none' }}>
                    <motion.div
                        variants={{ hover: { opacity: 1, y: 0 } }}
                        initial={{ opacity: 0, y: 20 }}
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            zIndex: 10
                        }}
                    >
                        <MagneticButton pullStrength={0.5}>
                            <div style={{
                                backgroundColor: 'var(--color-accent, #A3FF00)',
                                color: '#000',
                                padding: '12px 24px',
                                borderRadius: '30px',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                Open Project ➔
                            </div>
                        </MagneticButton>
                    </motion.div>
                </Link>
            ) : (
                <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <motion.div
                        variants={{ hover: { opacity: 1, y: 0 } }}
                        initial={{ opacity: 0, y: 20 }}
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            zIndex: 10
                        }}
                    >
                        <MagneticButton pullStrength={0.5}>
                            <div style={{
                                backgroundColor: '#fff',
                                color: '#000',
                                padding: '12px 24px',
                                borderRadius: '30px',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                View Live Site ↗
                            </div>
                        </MagneticButton>
                    </motion.div>
                </a>
            )}
        </motion.div>
    );
};

export default ProjectCard;
