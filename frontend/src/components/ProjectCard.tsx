import React from 'react';
import { motion } from 'framer-motion';
import type { Project } from '../services/api';

interface ProjectCardProps {
    project: Project;
    index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            style={{
                display: 'block',
                position: 'relative'
            }}
            whileHover="hover"
        >
            {/* Header (Project Info) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#fff' }}>
                    <motion.h3 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <motion.span
                            variants={{ hover: { x: 5 } }}
                            style={{ color: 'var(--color-accent)', fontSize: '1.2rem' }}
                        >
                            ➔
                        </motion.span>
                        {project.title}
                    </motion.h3>
                </a>
                <span style={{
                    padding: '0.2rem 0.8rem',
                    border: '1px solid #333',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    color: '#888'
                }}>
                    {project.year}
                </span>
            </div>

            {/* Browser Window Frame */}
            <motion.div
                className="window-frame"
                variants={{ hover: { scale: 0.99 } }} // Subtle scale instead of 0.98 to keep iframe usable
                transition={{ duration: 0.3 }}
                style={{
                    backgroundColor: '#1a1a1a', // Window chrome color
                    borderRadius: '16px',
                    overflow: 'hidden',
                    aspectRatio: '16/10',
                    position: 'relative',
                    border: '1px solid #333'
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

                    {/* Reload Button - Pushed to right */}
                    <div
                        title="Reload Preview"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            // Find the iframe in the next sibling container
                            const parent = e.currentTarget.closest('.window-frame');
                            const iframe = parent?.querySelector('iframe');
                            if (iframe) {
                                // Force reload by resetting src
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
                </div>

                {/* Live Website Preview (Iframe) */}
                <div
                    style={{
                        height: 'calc(100% - 32px)',
                        backgroundColor: '#111',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Interactive Iframe with Scaling for "Desktop" feel */}
                    <div style={{
                        width: '200%', // Double width
                        height: '200%', // Double height
                        transform: 'scale(0.5)', // Scale down to fit
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
                                pointerEvents: 'auto', // Enable interaction
                                backgroundColor: '#fff'
                            }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Live Preview Badge */}
            <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <motion.div
                    variants={{ hover: { opacity: 1, scale: 1 } }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                        backgroundColor: '#fff',
                        color: '#000',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                        cursor: 'pointer'
                    }}
                >
                    View Live Site ↗
                </motion.div>
            </a>
        </motion.div>
    );
};

export default ProjectCard;
