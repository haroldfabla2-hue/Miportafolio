import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue, useMotionValue, useSpring } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SEO from './SEO';
import RoiCalculator from './RoiCalculator';
import { getServiceSchema } from './JsonLd';
import TrustMarkers from './TrustMarkers';
import { usePricing } from '../hooks/usePricing';

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
    const { t, i18n } = useTranslation();
    const { pricing, isLoading } = usePricing();
    const isEnglish = i18n.language === 'en';
    const servicesContainer = useRef<HTMLDivElement>(null);
    const processContainer = useRef<HTMLDivElement>(null);

    const serviceKeys = ['saas', 'agents', 'booking'];

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
            <SEO 
                title={t('services.title')} 
                description={t('services.heroSubtitle')} 
                schemaMarkup={getServiceSchema(t('services.title'), t('services.heroSubtitle'))}
            />
            
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

            <TrustMarkers />

            {/* Services Cards */}
            <section ref={servicesContainer} style={{ marginBottom: '20vh' }}>
                {serviceKeys.map((key, i) => {
                    const tagsMap: Record<string, string[]> = {
                        saas: [t('services.items.saas.tags.tech'), t('services.items.saas.tags.arch'), t('services.items.saas.tags.core'), t('services.items.saas.tags.scale')],
                        agents: [t('services.items.agents.tags.auto'), t('services.items.agents.tags.nlp'), t('services.items.agents.tags.whatsapp'), t('services.items.agents.tags.cost')],
                        booking: [t('services.items.booking.tags.ui'), t('services.items.booking.tags.booking'), t('services.items.booking.tags.conv'), t('services.items.booking.tags.pay')]
                    };
                    const title = t(`services.items.${key}.title`);
                    const description = t(`services.items.${key}.description`);
                    const tags = tagsMap[key] || [];

                    return (
                        <div key={key} style={{
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
                                            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', margin: 0, lineHeight: 1, color: '#fff' }}>{title}</h2>
                                            <span style={{ fontSize: '1.5rem', color: 'var(--color-accent)', fontFamily: 'monospace' }}>0{i + 1}</span>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', color: '#aaa', maxWidth: '600px', lineHeight: 1.5 }}>{description}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {tags.map(tag => (
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

            {/* AI Solutions Section (Added from 30-Day Strategy) */}
            <section style={{ marginBottom: '20vh', padding: '0 var(--spacing-lg)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: 'rgba(20,20,20,0.6)', border: '1px solid rgba(163,255,0,0.2)', borderRadius: '25px', padding: 'clamp(2rem, 5vw, 4rem)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(163,255,0,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1.5rem' }}>🤖</span>
                        </div>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: 0, color: '#fff' }}>{t('services.aiTitle')}</h2>
                    </div>
                    
                    <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '3rem', maxWidth: '800px', lineHeight: 1.6 }}>
                        {t('services.aiDescription')}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
                        <div>
                            <h3 style={{ color: 'var(--color-accent)', marginBottom: '1rem', fontSize: '1.2rem' }}>{t('services.problems.title')}</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li style={{ display: 'flex', gap: '10px' }}><span>❌</span> {t('services.problems.manualDesc')}</li>
                                <li style={{ display: 'flex', gap: '10px' }}><span>❌</span> {t('services.problems.contractDesc')}</li>
                                <li style={{ display: 'flex', gap: '10px' }}><span>❌</span> {t('services.problems.supportDesc')}</li>
                            </ul>
                        </div>
                        <div>
                            <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.2rem' }}>{t('services.results.title')}</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li style={{ display: 'flex', gap: '10px' }}><span>✅</span> {t('services.results.invisibleDesc')}</li>
                                <li style={{ display: 'flex', gap: '10px' }}><span>✅</span> {t('services.results.cognitiveDesc')}</li>
                                <li style={{ display: 'flex', gap: '10px' }}><span>✅</span> {t('services.results.scalingDesc')}</li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.1rem' }}>{t('services.ai.featuredProjects')}</h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <a href="https://cg.unityiris.com" target="_blank" rel="noreferrer" style={{ padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                                {t('services.ai.contractGeneratorLink')}
                            </a>
                            <a href="https://github.com/haroldfabla2-hue/Silhouette-Agency-OS-OpenSource" target="_blank" rel="noreferrer" style={{ padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                                {t('services.ai.silhouetteLink')}
                            </a>
                        </div>
                        
                        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                            <a href="/contact" style={{ display: 'inline-block', padding: '15px 30px', backgroundColor: 'var(--color-accent)', color: '#000', fontWeight: 'bold', borderRadius: '30px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {t('services.ai.cta')}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Calculadora de ROI Section */}
            <section style={{ marginBottom: '20vh', padding: '0 var(--spacing-lg)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', fontWeight: 900, textTransform: 'uppercase' }}>
                            {t('services.roiAuditTitlePart1')} <span style={{ color: 'var(--color-accent)' }}>{t('services.roiAuditTitlePart2')}</span>
                        </h2>
                        <p style={{ color: '#999', fontSize: '1.2rem', marginTop: '1rem' }}>
                            {t('services.roiAuditSubtitle')}
                        </p>
                    </div>
                    <RoiCalculator />
                </div>
            </section>

            {/* Planes y Precios Section */}
            <section style={{ marginBottom: '20vh', padding: '0 var(--spacing-lg)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#fff', fontWeight: 900, textTransform: 'uppercase' }}>
                            {t('services.pricing.title')}
                        </h2>
                        <p style={{ color: '#999', fontSize: '1.2rem', marginTop: '1rem', maxWidth: '700px', margin: '1rem auto 0 auto' }}>
                            {t('services.pricing.subtitle')}
                        </p>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                        gap: '2rem', 
                        alignItems: 'stretch' 
                    }}>
                        {isLoading ? (
                            <div style={{ color: '#aaa', textAlign: 'center', width: '100%', padding: '2rem' }}>
                                Loading pricing...
                            </div>
                        ) : (
                            pricing.map((plan) => {
                                const meta = plan.metadata || {};
                                const localized = isEnglish && meta.i18n?.en ? meta.i18n.en : {
                                    title: plan.title,
                                    content: plan.content,
                                    badge: meta.badge,
                                    price: meta.price,
                                    features: meta.features || []
                                };
                                const isPopular = meta.popular;

                                // Base plan key from slug (e.g., 'plan-esencial' -> 'esencial')
                                const planKey = plan.slug.replace('plan-', '');

                                return (
                                    <div key={plan.id || plan.slug} style={{ 
                                        backgroundColor: isPopular ? 'rgba(25,25,25,0.8)' : 'rgba(15,15,15,0.7)', 
                                        border: isPopular ? '2px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.05)', 
                                        borderRadius: '25px', 
                                        padding: '3rem 2rem', 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        justifyContent: 'space-between',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.3s ease',
                                        transform: isPopular ? 'scale(1.02)' : 'scale(1)',
                                        boxShadow: isPopular ? '0 20px 40px rgba(163,255,0,0.15)' : 'none',
                                        position: 'relative'
                                    }}>
                                        {isPopular && (
                                            <div style={{ 
                                                position: 'absolute', 
                                                top: '-15px', 
                                                left: '50%', 
                                                transform: 'translateX(-50%)', 
                                                backgroundColor: 'var(--color-accent)', 
                                                color: '#000', 
                                                padding: '6px 16px', 
                                                borderRadius: '20px', 
                                                fontSize: '0.8rem', 
                                                fontWeight: 'bold', 
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                {t('services.pricing.mostPopular')}
                                            </div>
                                        )}
                                        <div>
                                            <span style={{ 
                                                color: isPopular ? 'var(--color-accent)' : '#aaa', 
                                                fontSize: '0.9rem', 
                                                textTransform: 'uppercase', 
                                                letterSpacing: '0.1em',
                                                fontWeight: isPopular ? 'bold' : 'normal'
                                            }}>
                                                {localized.badge}
                                            </span>
                                            <h3 style={{ color: '#fff', fontSize: '2rem', margin: '0.5rem 0' }}>{localized.title}</h3>
                                            <p style={{ color: isPopular ? '#999' : '#777', fontSize: '0.95rem', marginBottom: '2rem', minHeight: '40px' }}>
                                                {localized.content}
                                            </p>
                                            
                                            <div style={{ marginBottom: '2rem' }}>
                                                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>{localized.price}</span>
                                                <span style={{ color: isPopular ? 'var(--color-accent)' : '#555', fontSize: '0.9rem', fontWeight: isPopular ? 'bold' : 'normal', marginLeft: '8px' }}>
                                                    {t(isPopular ? 'services.pricing.paymentType' : planKey === 'corporativo' ? 'services.pricing.from' : 'services.pricing.paymentType')}
                                                </span>
                                            </div>

                                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', color: isPopular ? '#ccc' : '#aaa', fontSize: '0.95rem' }}>
                                                {(localized.features as string[]).map((feat, idx) => (
                                                    <li key={idx} style={{ display: 'flex', gap: '10px' }}><span>✓</span> {feat}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <a href={`/contact?plan=${planKey}`} style={{ 
                                            display: 'block', 
                                            width: '100%', 
                                            textAlign: 'center', 
                                            padding: '14px', 
                                            borderRadius: '30px', 
                                            backgroundColor: isPopular ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)', 
                                            border: isPopular ? 'none' : '1px solid rgba(255,255,255,0.1)', 
                                            color: isPopular ? '#000' : '#fff', 
                                            fontWeight: 'bold', 
                                            textDecoration: 'none',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {t(isPopular ? 'services.pricing.startProject' : planKey === 'corporativo' ? 'services.pricing.quoteSolution' : 'services.pricing.selectPlan')}
                                        </a>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>

            {/* Impact & Case Studies Section */}
            <section style={{ marginBottom: '20vh', padding: '0 var(--spacing-lg)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: 0, color: '#fff', fontWeight: 900 }}>
                            {t('services.impact.titlePart1')} <span style={{ color: 'var(--color-accent)' }}>{t('services.impact.titlePart2')}</span>
                        </h2>
                        <p style={{ color: '#999', fontSize: '1.2rem', marginTop: '1rem' }}>{t('services.impact.subtitle')}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* Case 1 */}
                        <div style={{ backgroundColor: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2rem', backdropFilter: 'blur(10px)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>{t('services.impact.case1.title')}</h3>
                            <div style={{ color: 'var(--color-accent)', fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>{t('services.impact.case1.metric')}</div>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                <strong>{t('services.impact.case1.problem')}</strong><br/><br/>
                                <strong>{t('services.impact.case1.solution')}</strong><br/><br/>
                                <strong>{t('services.impact.case1.result')}</strong>
                            </p>
                        </div>

                        {/* Case 2 */}
                        <div style={{ backgroundColor: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2rem', backdropFilter: 'blur(10px)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>{t('services.impact.case2.title')}</h3>
                            <div style={{ color: 'var(--color-accent)', fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>{t('services.impact.case2.metric')}</div>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                <strong>{t('services.impact.case2.problem')}</strong><br/><br/>
                                <strong>{t('services.impact.case2.solution')}</strong><br/><br/>
                                <strong>{t('services.impact.case2.result')}</strong>
                            </p>
                        </div>

                        {/* Case 3 */}
                        <div style={{ backgroundColor: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2rem', backdropFilter: 'blur(10px)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>{t('services.impact.case3.title')}</h3>
                            <div style={{ color: 'var(--color-accent)', fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>{t('services.impact.case3.metric')}</div>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                <strong>{t('services.impact.case3.problem')}</strong><br/><br/>
                                <strong>{t('services.impact.case3.solution')}</strong><br/><br/>
                                <strong>{t('services.impact.case3.result')}</strong>
                            </p>
                        </div>
                    </div>
                </div>
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
