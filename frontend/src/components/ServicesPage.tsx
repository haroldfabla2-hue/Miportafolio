import React from 'react';
import { motion } from 'framer-motion';
import SEO from './SEO';
import Process from './Process';

const services = [
    {
        title: "Web Design",
        description: "Crafting visually stunning and user-centric interfaces. I focus on aesthetic excellence paired with intuitive functionality to create digital experiences that captivate and convert.",
        tags: ["UI/UX", "Art Direction", "Prototyping", "Design Systems"]
    },
    {
        title: "Web Development",
        description: "Bringing designs to life with clean, robust, and scalable code. Specializing in modern React ecosystems, animation libraries, and performance-first architecture.",
        tags: ["React/Vite", "TypeScript", "GSAP/Framer Motion", "WebGL"]
    },
    {
        title: "Branding & Strategy",
        description: "Defining the core identity of your business. From logo design to comprehensive brand guidelines, I help build brands that resonate and endure.",
        tags: ["Logo Design", "Brand Identity", "Strategy", "Visual Language"]
    }
];

const ServicesPage: React.FC = () => {
    return (
        <div style={{ paddingTop: '150px', minHeight: '100vh', paddingBottom: '100px' }}>
            <SEO title="Expertise" description="Comprehensive digital services including web design, development, and branding strategy." />
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
                        fontSize: 'clamp(3rem, 7vw, 6rem)',
                        fontWeight: 900,
                        lineHeight: 0.9,
                        letterSpacing: '-0.02em',
                        marginBottom: '30px',
                        textTransform: 'uppercase'
                    }}
                >
                    Expertise & <br /> Solutions
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ fontSize: '1.5rem', color: '#999', maxWidth: '600px' }}
                >
                    A comprehensive suite of digital services designed to elevate your brand and establish a dominant online presence.
                </motion.p>
            </section>

            {/* Service Cards */}
            <section style={{
                padding: '0 var(--spacing-lg)',
                maxWidth: 'var(--spacing-container)',
                margin: '0 auto 150px auto'
            }}>
                <div style={{ display: 'grid', gap: '4rem' }}>
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                border: '1px solid #333',
                                borderRadius: '30px',
                                padding: 'clamp(2rem, 5vw, 4rem)',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                display: 'grid',
                                gridTemplateColumns: '1fr 2fr',
                                gap: '2rem',
                                alignItems: 'start'
                            }}
                        >
                            <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{service.title}</h3>
                            <div>
                                <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#ccc', marginBottom: '2rem' }}>
                                    {service.description}
                                </p>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {service.tags.map(tag => (
                                        <span key={tag} style={{
                                            backgroundColor: '#111',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem',
                                            border: '1px solid #333',
                                            color: '#888'
                                        }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Reuse Process Section */}
            <section style={{ marginBottom: '100px' }}>
                <h2 style={{
                    textAlign: 'center',
                    fontSize: '3rem',
                    marginBottom: '50px',
                    fontWeight: 800
                }}>
                    THE PROCESS
                </h2>
                <Process />
            </section>
        </div>
    );
};

export default ServicesPage;
