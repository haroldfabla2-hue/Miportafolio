import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
    return (
        <section
            id="about"
            style={{
                backgroundColor: 'var(--color-light-bg)',
                color: 'var(--color-dark-text)',
                padding: 'var(--spacing-huge) 0',
                position: 'relative',
                borderRadius: '40px', // Uniform curve for floating card effect
                marginTop: '-40px' // Negative margin to pull over the dark section
            }}
        >
            <div style={{
                maxWidth: 'var(--spacing-container)',
                margin: '0 auto',
                padding: '0 var(--spacing-lg)'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
                    {/* Left Column: Image placeholder */}
                    <div style={{
                        height: '600px',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <img
                            src="/about-journey.png"
                            alt="Design Journey"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '2rem',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
                        }}>
                            <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>Based in Arequipa, Peru</span>
                        </div>
                    </div>

                    {/* Right Column: Text */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            style={{ fontSize: '3.5rem', lineHeight: '1.1', fontWeight: 800, marginBottom: 'var(--spacing-lg)' }}
                        >
                            DISCOVER MY <br />
                            DESIGN JOURNEY.
                        </motion.h2>
                        <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6', marginBottom: 'var(--spacing-lg)' }}>
                            I started my journey 5 years ago... [Placeholder for bio content] ...transforming ideas into digital reality.
                        </p>

                        <button style={{
                            padding: '1rem 2rem',
                            border: '2px solid #000',
                            borderRadius: '50px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            width: 'fit-content'
                        }}>
                            More About Me
                        </button>
                    </div>
                </div>

                {/* Stats Banner */}
                <div style={{
                    marginTop: 'var(--spacing-huge)',
                    padding: 'var(--spacing-lg)',
                    backgroundColor: 'var(--color-accent)',
                    borderRadius: '20px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center'
                }}>
                    <StatItem number="05+" label="Years of Experience" />
                    <div style={{ width: '1px', height: '50px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
                    <StatItem number="20+" label="Projects Completed" />
                    <div style={{ width: '1px', height: '50px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
                    <StatItem number="98%" label="Client Satisfaction" />
                </div>
            </div>
        </section>
    );
};

const StatItem = ({ number, label }: { number: string, label: string }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{number}</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.7 }}>{label}</div>
    </div>
);

export default About;
