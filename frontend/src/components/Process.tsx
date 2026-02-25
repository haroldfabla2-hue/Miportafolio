import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface Step {
    number: string;
    title: string;
    description: string;
}

interface ProcessCardProps {
    item: Step;
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
            <motion.div
                whileHover={{ y: -10, borderColor: '#4a4a4a', boxShadow: '0 35px 70px -20px rgba(0, 0, 0, 0.65)' }}
                transition={{ y: { duration: 0.25, ease: 'easeOut' } }}
                style={{
                    backgroundColor: 'var(--color-bg)',
                    borderRadius: '25px',
                    padding: 'clamp(2rem, 5vw, 4rem)',
                    width: 'clamp(300px, 90vw, 1000px)',
                    height: 'clamp(300px, 60vh, 500px)',
                    transformOrigin: 'top',
                    scale,
                    border: '1px solid #333',
                    position: 'relative',
                    top: `calc(-5vh + ${index * 25}px)`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', margin: 0, lineHeight: 1 }}>{item.title}</h2>
                    <span style={{ fontSize: '1.5rem', color: 'var(--color-accent)', fontFamily: 'monospace' }}>{item.number}</span>
                </div>
                <div>
                    <p style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', color: '#999', maxWidth: '600px', lineHeight: 1.5 }}>{item.description}</p>
                </div>
            </motion.div>
        </div>
    );
};

const Process = () => {
    const { t } = useTranslation();
    const container = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start start', 'end end']
    });

    const stepsData: Step[] = [
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

    return (
        <section ref={container} style={{ marginBottom: '20vh' }}>
            {/* Section Title */}
            <div style={{ 
                padding: '0 var(--spacing-lg)', 
                maxWidth: 'var(--spacing-container)', 
                margin: '0 auto 100px auto' 
            }}>
                <h4 style={{ 
                    color: 'var(--color-accent)', 
                    marginBottom: '1rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.2em' 
                }}>
                    {t('services.myProcess')}
                </h4>
                <p style={{ fontSize: '2rem', color: '#fff', maxWidth: '600px' }}>
                    {t('services.processDescription')}
                </p>
            </div>

            {/* Process Cards with Animation */}
            {stepsData.map((step, i) => {
                const targetScale = 1 - ((stepsData.length - i) * 0.05);
                return (
                    <ProcessCard
                        key={i}
                        item={step}
                        index={i}
                        progress={scrollYProgress}
                        range={[i * 0.2, 1]}
                        targetScale={targetScale}
                    />
                );
            })}
        </section>
    );
};

export default Process;
