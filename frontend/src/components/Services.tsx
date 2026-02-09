import React from 'react';
import { motion } from 'framer-motion';

const Services: React.FC = () => {
    return (
        <section
            id="services"
            style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                padding: 'var(--spacing-huge) 0',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Ghost Text Background */}
            {/* Ghost Text Background */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '0',
                width: '100%',
                transform: 'translateY(-50%) perspective(500px)', // Added perspective for depth potential
                zIndex: 0,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                opacity: 0.15, // Significantly increased from 0.08 for visibility
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                <motion.div
                    animate={{ x: ["0%", "-50%"] }} // Smooth infinite scroll
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    style={{
                        fontSize: '9rem', // Slightly smaller
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        lineHeight: 1,
                        color: 'rgba(255,255,255,0.05)', // Use a fill color instead of stroke for better visibility
                        WebkitTextStroke: '1px solid rgba(255,255,255,0.1)', // Add stroke back for definition
                        scale: 1
                    }}
                >
                    Empowering Brands • Empowering Brands • Empowering Brands • Empowering Brands •
                </motion.div>
            </div>

            <div style={{
                maxWidth: 'var(--spacing-container)',
                margin: '0 auto',
                padding: '0 var(--spacing-lg)',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>WHAT I OFFER</h2>
                    <p style={{ color: '#888', fontSize: '1.2rem' }}>Comprehensive digital solutions for modern businesses.</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '2rem'
                }}>
                    <ServiceCard
                        title="Web Design"
                        items={['UI/UX Design', 'Wireframing', 'Prototyping', 'Design Systems']}
                    />
                    <ServiceCard
                        title="Development"
                        items={['React / Next.js', 'Animation', 'CMS Integration', 'eCommerce']}
                        highlight
                    />
                    <ServiceCard
                        title="Branding"
                        items={['Logo Design', 'Brand Identity', 'Social Assets', 'Guidelines']}
                    />
                </div>
            </div>
        </section>
    );
};

const ServiceCard = ({ title, items, highlight = false }: { title: string, items: string[], highlight?: boolean }) => (
    <motion.div
        whileHover={{ y: -10 }}
        style={{
            backgroundColor: highlight ? 'var(--color-accent)' : '#1a1a1a',
            color: highlight ? '#000' : '#fff',
            padding: '3rem 2rem',
            borderRadius: '20px',
            border: highlight ? 'none' : '1px solid #333'
        }}
    >
        <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>{title}</h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.1rem', fontWeight: 500 }}>
                    <span style={{ fontSize: '1.5rem' }}>•</span> {item}
                </li>
            ))}
        </ul>
    </motion.div>
)

export default Services;
