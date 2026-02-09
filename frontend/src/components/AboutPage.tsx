import React from 'react';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
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
                        marginBottom: '30px',
                        textTransform: 'uppercase'
                    }}
                >
                    Beyond the <br /> Pixels
                </motion.h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', marginTop: '50px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>My Journey</h3>
                        <p style={{ fontSize: '1.2rem', color: '#999', lineHeight: 1.6 }}>
                            With over 5 years of experience in digital creation, I've evolved from a curious designer to a full-stack digital craftsman. My passion lies in the intersection of design and technology, where I believe the most impactful user experiences are born.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Philosophy</h3>
                        <p style={{ fontSize: '1.2rem', color: '#999', lineHeight: 1.6 }}>
                            I believe in "less, but better". Every pixel should have a purpose, and every interaction should feel natural. My approach is holistic—considering performance, accessibility, and aesthetics as equal pillars of a successful product.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section Enhanced */}
            <section style={{
                padding: '100px var(--spacing-lg)',
                backgroundColor: '#fff',
                color: '#111',
                borderRadius: '40px',
                margin: '0 var(--spacing-lg) 150px var(--spacing-lg)' // Add margin to float it
            }}>
                <div style={{ maxWidth: 'var(--spacing-container)', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '80px', textAlign: 'center' }}>
                        IMPACT BY THE NUMBERS
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', textAlign: 'center' }}>
                        {[
                            { label: "Years Experience", value: "05+" },
                            { label: "Successful Projects", value: "20+" },
                            { label: "Client Satisfaction", value: "100%" },
                            { label: "Coffee Consumed", value: "∞" }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div style={{
                                    fontSize: 'clamp(3rem, 6vw, 5rem)',
                                    fontWeight: 900,
                                    lineHeight: 1,
                                    marginBottom: '1rem',
                                    // Override accent color to fit white background if needed. Neon green on white might be hard to read.
                                    // Let's use black for high contrast + stroke or just black.
                                    color: '#111'
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Me / Soft Skills */}
            <section style={{
                padding: '0 var(--spacing-lg)',
                maxWidth: 'var(--spacing-container)',
                margin: '0 auto'
            }}>
                <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '50px' }}>WHY WORK WITH ME?</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {[
                        { title: "Collaborative", text: "I view every project as a partnership. Your vision + my expertise." },
                        { title: "Detail Oriented", text: "Obsessed with the micro-interactions that make a site feel alive." },
                        { title: "Transparent", text: "Clear communication, no tech-jargon, and honest timelines." },
                        { title: "Forward Thinking", text: "Always using the latest stable technologies for future-proof solutions." }
                    ].map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                padding: '2rem',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}
                        >
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-accent)' }}>{item.title}</h4>
                            <p style={{ color: '#ccc', lineHeight: 1.5 }}>{item.text}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
