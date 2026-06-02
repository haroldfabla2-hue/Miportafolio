import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue, useMotionValue, useSpring } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SEO from './SEO';

// Reusable 3D Tilt Wrapper
const TiltWrapper: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className, style }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                ...style,
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: 1000
            }}
            className={className}
        >
            {/* The child needs to be translated slightly on Z to pop out */}
            <motion.div style={{ transform: "translateZ(50px)", width: '100%', height: '100%' }}>
                {children}
            </motion.div>
        </motion.div>
    );
};

// Process Card Component
interface ProcessCardProps {
    item: {
        number: string;
        title: string;
        description: string;
    };
    index: number;
    progress: MotionValue<number>;
    range: [number, number];
    targetScale: number;
}

const ProcessCard: React.FC<ProcessCardProps> = ({ item, index, progress, range, targetScale }) => {
    const container = useRef<HTMLDivElement>(null);
    const scale = useTransform(progress, range, [1, targetScale]);

    return (
        <div ref={container} style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'sticky',
            top: 0
        }}>
            <motion.div style={{
                width: 'clamp(300px, 90vw, 1000px)',
                height: 'clamp(300px, 60vh, 500px)',
                transformOrigin: 'top',
                scale,
                position: 'relative',
                top: `calc(-5vh + ${index * 25}px)`,
                perspective: 1200
            }}>
                <TiltWrapper style={{ width: '100%', height: '100%' }}>
                    <div style={{
                        backgroundColor: 'var(--color-bg)',
                        borderRadius: '25px',
                        padding: 'clamp(2rem, 5vw, 4rem)',
                        width: '100%',
                        height: '100%',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255,255,255,0.02)',
                        backdropFilter: 'blur(10px)',
                        background: 'linear-gradient(145deg, rgba(30,30,30,0.8) 0%, rgba(10,10,10,0.9) 100%)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', margin: 0, lineHeight: 1, color: '#fff' }}>{item.title}</h2>
                            <span style={{ fontSize: '1.5rem', color: 'var(--color-accent)', fontFamily: 'monospace' }}>{item.number}</span>
                        </div>
                        <div>
                            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', color: '#aaa', maxWidth: '600px', lineHeight: 1.5 }}>{item.description}</p>
                        </div>
                    </div>
                </TiltWrapper>
            </motion.div>
        </div>
    );
};

// Services Page Component
const ServicesPage: React.FC = () => {
    const { t } = useTranslation();
    const servicesContainer = useRef<HTMLDivElement>(null);
    const processContainer = useRef<HTMLDivElement>(null);

    const services = [
        {
            title: t('services.webDesign.title'),
            description: t('services.webDesign.description'),
            tags: ["UI/UX", "Art Direction", "Prototyping", "Design Systems"]
        },
        {
            title: t('services.webDev.title'),
            description: t('services.webDev.description'),
            tags: ["React/Vite", "TypeScript", "GSAP/Framer Motion", "WebGL"]
        },
        {
            title: t('services.branding.title'),
            description: t('services.branding.description'),
            tags: ["Logo Design", "Brand Identity", "Strategy", "Visual Language"]
        }
    ];

    const steps = [
        {
            number: '01',
            title: t('services.steps.discovery'),
            description: t('services.steps.discoveryDesc')
        },
        {
            number: '02',
            title: t('services.steps.strategy'),
            description: t('services.steps.strategyDesc')
        },
        {
            number: '03',
            title: t('services.steps.design'),
            description: t('services.steps.designDesc')
        },
        {
            number: '04',
            title: t('services.steps.development'),
            description: t('services.steps.developmentDesc')
        },
        {
            number: '05',
            title: t('services.steps.launch'),
            description: t('services.steps.launchDesc')
        }
    ];
    
    const { scrollYProgress: servicesProgress } = useScroll({
        target: servicesContainer,
        offset: ['start start', 'end end']
    });

    const { scrollYProgress: processProgress } = useScroll({
        target: processContainer,
        offset: ['start start', 'end end']
    });

    return (
        <div style={{ paddingTop: '150px', minHeight: '100vh', paddingBottom: '100px' }}>
            <SEO title={t('services.title')} description={t('services.heroSubtitle')} />
            
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
                    {t('services.heroTitle')}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ fontSize: '1.5rem', color: '#999', maxWidth: '600px' }}
                >
                    {t('services.heroSubtitle')}
                </motion.p>
            </section>

            {/* Services Cards */}
            <section ref={servicesContainer} style={{ marginBottom: '20vh' }}>
                {services.map((service, i) => {
                    // Stacking Effect logic
                    return (
                        <div key={i} style={{
                            height: '100vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'sticky',
                            top: 0
                        }}>
                            <motion.div style={{
                                width: 'clamp(300px, 90vw, 1000px)',
                                height: 'clamp(300px, 60vh, 500px)',
                                transformOrigin: 'top',
                                position: 'relative',
                                top: `calc(-5vh + ${i * 25}px)`,
                                perspective: 1200
                            }}>
                                <TiltWrapper style={{ width: '100%', height: '100%' }}>
                                    <div style={{
                                        backgroundColor: 'var(--color-bg)',
                                        borderRadius: '25px',
                                        padding: 'clamp(2rem, 5vw, 4rem)',
                                        width: '100%',
                                        height: '100%',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255,255,255,0.02)',
                                        background: 'linear-gradient(135deg, rgba(20,20,20,1) 0%, rgba(5,5,5,1) 100%)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', margin: 0, lineHeight: 1, color: '#fff' }}>{service.title}</h2>
                                            <span style={{ fontSize: '1.5rem', color: 'var(--color-accent)', fontFamily: 'monospace' }}>0{i + 1}</span>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', color: '#aaa', maxWidth: '600px', lineHeight: 1.5 }}>{service.description}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {service.tags.map(tag => (
                                                <span key={tag} style={{
                                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                                    padding: '8px 16px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    color: '#ddd',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </TiltWrapper>
                            </motion.div>
                        </div>
                    );
                })}
            </section>

            {/* Process Section - WITH ANIMATION */}
            <section ref={processContainer} style={{ marginBottom: '20vh', padding: '0 var(--spacing-lg)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto 100px auto' }}>
                    <h4 style={{ color: 'var(--color-accent)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{t('services.myProcess')}</h4>
                    <p style={{ fontSize: '2rem', color: '#fff', maxWidth: '600px' }}>
                        {t('services.processDescription')}
                    </p>
                </div>
                {steps.map((step, i) => {
                    const targetScale = 1 - ((steps.length - i) * 0.05);
                    return (
                        <ProcessCard
                            key={i}
                            item={step}
                            index={i}
                            progress={processProgress}
                            range={[i * 0.2, 1]}
                            targetScale={targetScale}
                        />
                    );
                })}
            </section>
        </div>
    );
};

export default ServicesPage;
