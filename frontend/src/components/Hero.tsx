import React from 'react';
import { motion, type Variants, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Hero: React.FC = () => {
    const { t } = useTranslation();
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        }
    };

    // Parallax Effect
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, 100]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 var(--spacing-lg)',
            paddingTop: '80px', // Account for fixed navbar
            maxWidth: 'var(--spacing-container)',
            margin: '0 auto',
            position: 'relative'
        }}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ position: 'relative', zIndex: 1 }}
            >
                {/* Badge */}
                <motion.div variants={itemVariants} style={{ marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '0.5rem 1rem',
                        borderRadius: '50px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        letterSpacing: '0.05em',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--color-accent)'
                                }}
                            />
                            <div style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: 'var(--color-accent)',
                                borderRadius: '50%',
                                position: 'relative',
                                zIndex: 1
                            }} />
                        </div>
                        {t('home.hero.availableForWork')}
                    </div>
                </motion.div>

                {/* Massive Typography with Parallax */}
                <motion.h1 style={{ y: y1, opacity }}>
                    <motion.div variants={itemVariants} style={{
                        fontSize: 'clamp(3rem, 7vw, 6rem)', // Responsive font size
                        fontWeight: 800,
                        lineHeight: '0.9',
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.02em'
                    }}>
                        {t('home.heroTitle').toUpperCase()}
                    </motion.div>
                    <motion.div variants={itemVariants} style={{
                        fontSize: 'clamp(3rem, 7vw, 6rem)',
                        fontWeight: 800,
                        lineHeight: '0.9',
                        color: '#666', // Muted color for contract
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.02em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <span style={{
                            height: '2px',
                            flexGrow: 1,
                            backgroundColor: 'var(--color-accent)',
                            display: 'block',
                            marginTop: '0.5em'
                        }} />
                    </motion.div>
                    <motion.div variants={itemVariants} style={{
                        fontSize: 'clamp(3rem, 7vw, 6rem)',
                        fontWeight: 800,
                        lineHeight: '0.9',
                        letterSpacing: '-0.02em'
                    }}>
                        {t('home.hero.websites')}
                    </motion.div>
                </motion.h1>

                {/* Subtext */}
                <motion.div
                    style={{
                        marginTop: '3rem',
                        maxWidth: '500px',
                        y: y2,
                        opacity
                    }}
                    variants={itemVariants}
                >
                    <p style={{
                        fontSize: '1.2rem',
                        lineHeight: '1.6',
                        color: '#999',
                        fontWeight: 400
                    }}>
                        {t('home.heroSubtitle')}
                    </p>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ delay: 2, duration: 2, repeat: Infinity }}
                style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 0
                }}
            >
                <div style={{
                    width: '24px',
                    height: '40px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: '8px'
                }}>
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        style={{
                            width: '4px',
                            height: '4px',
                            backgroundColor: '#fff',
                            borderRadius: '50%'
                        }}
                    />
                </div>
            </motion.div>
        </section >
    );
};

export default Hero;
