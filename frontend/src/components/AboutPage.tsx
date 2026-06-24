import React, { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SEO from './SEO';
import PremiumStackingLayer from './PremiumStackingLayer';

const AboutPage: React.FC = () => {
    const { t } = useTranslation();
    const whyMeContainer = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: whyMeContainer,
        offset: ['start start', 'end end']
    });

    const whyMeKeys = ['collaborative', 'detailOriented', 'transparent', 'forwardThinking'];

    return (
        <div style={{ paddingTop: '150px', minHeight: '100vh', paddingBottom: '100px' }}>
            <SEO title={t('about.seoTitle')} description={t('about.seoDescription')} />
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
                    {t('about.heroTitle')}
                </motion.h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', marginTop: '50px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>{t('about.journeyTitle')}</h3>
                        <p style={{ fontSize: '1.2rem', color: '#999', lineHeight: 1.6 }}>
                            {t('about.journeyText')}
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>{t('about.philosophyTitle')}</h3>
                        <p style={{ fontSize: '1.2rem', color: '#999', lineHeight: 1.6 }}>
                            {t('about.philosophyText')}
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
                margin: '0 var(--spacing-lg) 150px var(--spacing-lg)' 
            }}>
                <div style={{ maxWidth: 'var(--spacing-container)', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '80px', textAlign: 'center' }}>
                        {t('about.statsTitle')}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', textAlign: 'center' }}>
                        {[
                            { label: t('about.stats.yearsExperience'), value: "05+" },
                            { label: t('about.stats.successfulProjects'), value: "20+" },
                            { label: t('about.stats.clientSatisfaction'), value: "100%" },
                            { label: t('about.stats.coffeeConsumed'), value: "∞" }
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

            {/* Why Me / Soft Skills - Premium Stacking */}
            <section ref={whyMeContainer} style={{
                marginBottom: '20vh', 
                padding: '0 var(--spacing-lg)'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto 100px auto' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '20px' }}>{t('home.whyWorkWithMe')}</h2>
                    <p style={{ color: '#999', fontSize: '1.2rem' }}>{t('about.whyWorkWithMeSubtitle')}</p>
                </div>
                
                {whyMeKeys.map((key, i) => (
                    <PremiumStackingLayer key={key} index={i} totalCards={whyMeKeys.length} progress={scrollYProgress}>
                        <div style={{
                            padding: 'clamp(2rem, 5vw, 4rem)',
                            backgroundColor: 'rgba(20,20,20,0.95)',
                            borderRadius: '25px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            width: 'clamp(300px, 90vw, 900px)',
                            height: 'clamp(250px, 40vh, 400px)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <h4 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-accent)' }}>
                                {t(`about.values.${key}.title`)}
                            </h4>
                            <p style={{ color: '#ccc', lineHeight: 1.6, fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
                                {t(`about.values.${key}.description`)}
                            </p>
                        </div>
                    </PremiumStackingLayer>
                ))}
            </section>
        </div>
    );
};

export default AboutPage;
