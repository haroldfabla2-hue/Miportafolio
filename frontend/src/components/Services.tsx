import React, { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PremiumStackingLayer from './PremiumStackingLayer';

const Services: React.FC = () => {
    const { t } = useTranslation();
    const servicesContainer = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: servicesContainer,
        offset: ['start start', 'end end']
    });

    const servicesList = [
        {
            title: t('services.webDesign.title'),
            items: t('services.webDesign.items', { returnObjects: true }) as string[],
            highlight: false
        },
        {
            title: t('services.development.title'),
            items: t('services.development.items', { returnObjects: true }) as string[],
            highlight: true
        },
        {
            title: t('services.branding.title'),
            items: ['Logo Design', 'Brand Identity', 'Social Assets', 'Guidelines'],
            highlight: false
        }
    ];
    
    return (
        <section
            id="services"
            ref={servicesContainer}
            style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                padding: 'var(--spacing-huge) 0',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '20vh'
            }}
        >
            {/* Ghost Text Background */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '0',
                width: '100%',
                transform: 'translateY(-50%) perspective(500px)',
                zIndex: 0,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                opacity: 0.15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    style={{
                        fontSize: '9rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        lineHeight: 1,
                        color: 'rgba(255,255,255,0.05)',
                        WebkitTextStroke: '1px solid rgba(255,255,255,0.1)',
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
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>{t('services.title')}</h2>
                    <p style={{ color: '#888', fontSize: '1.2rem' }}>{t('services.subtitle')}</p>
                </div>

                {/* Stacking Cards Sequence */}
                {servicesList.map((service, i) => (
                    <PremiumStackingLayer key={service.title} index={i} totalCards={servicesList.length} progress={scrollYProgress}>
                        <div style={{
                            backgroundColor: service.highlight ? 'var(--color-accent)' : 'rgba(26,26,26,0.95)',
                            color: service.highlight ? '#000' : '#fff',
                            padding: 'clamp(2rem, 5vw, 4rem)',
                            borderRadius: '25px',
                            border: service.highlight ? 'none' : '1px solid rgba(255,255,255,0.05)',
                            width: 'clamp(300px, 90vw, 900px)',
                            height: 'clamp(350px, 50vh, 500px)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}>
                            <h3 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: '2rem' }}>{service.title}</h3>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {service.items.map(item => (
                                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', fontWeight: 500 }}>
                                        <span style={{ fontSize: '1.5rem', color: service.highlight ? '#000' : 'var(--color-accent)' }}>•</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </PremiumStackingLayer>
                ))}
            </div>
        </section>
    );
};

export default Services;
