import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

const steps = [
    {
        number: '01',
        title: 'Discovery',
        description: 'We start by understanding your business goals, target audience, and unique value proposition. This foundation ensures the design aligns with your vision.'
    },
    {
        number: '02',
        title: 'Strategy',
        description: 'Developing a roadmap and digital strategy to ensure project success. We define the user journey and key performance indicators.'
    },
    {
        number: '03',
        title: 'Design',
        description: 'Crafting pixel-perfect, user-centric interfaces that engage and convert. We focus on modern aesthetics and intuitive usability.'
    },
    {
        number: '04',
        title: 'Development',
        description: 'Turning designs into clean, efficient code using React, TypeScript, and modern animation libraries. Ensuring speed, SEO, and responsiveness.'
    },
    {
        number: '05',
        title: 'Launch',
        description: 'Deployment, testing, and final optimization. I provide documentation and support to help you manage and grow your new digital asset.'
    }
];

interface CardProps {
    item: typeof steps[0];
    index: number;
    progress: MotionValue<number>;
    range: [number, number];
    targetScale: number;
}

const Card: React.FC<CardProps> = ({ item, index, progress, range, targetScale }) => {
    const container = useRef(null);
    // useScroll removed as it was unused. We rely on the parent's progress prop.

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
                backgroundColor: 'var(--color-bg)',
                borderRadius: '25px',
                padding: '50px',
                width: '1000px',
                height: '500px',
                transformOrigin: 'top',
                scale,
                border: '1px solid #333',
                position: 'relative',
                top: `calc(-5vh + ${index * 25}px)`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h2 style={{ fontSize: '3.5rem', margin: 0, lineHeight: 1 }}>{item.title}</h2>
                    <span style={{ fontSize: '2rem', color: 'var(--color-accent)', fontFamily: 'monospace' }}>{item.number}</span>
                </div>
                <div>
                    <p style={{ fontSize: '1.5rem', color: '#999', maxWidth: '600px', lineHeight: 1.5 }}>{item.description}</p>
                </div>
            </motion.div>
        </div>
    );
};

const Process: React.FC = () => {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start start', 'end end']
    });

    return (
        <section ref={container} style={{ marginTop: '20vh', marginBottom: '20vh', padding: '0 var(--spacing-lg)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto 100px auto' }}>
                <h4 style={{ color: 'var(--color-accent)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>My Process</h4>
                <p style={{ fontSize: '2rem', color: '#fff', maxWidth: '600px' }}>
                    A transparent and collaborative workflow designed to deliver exceptional results.
                </p>
            </div>
            {steps.map((step, i) => {
                const targetScale = 1 - ((steps.length - i) * 0.05);
                return (
                    <Card
                        key={i}
                        item={step}
                        index={i}
                        progress={scrollYProgress}
                        range={[i * 0.25, 1]}
                        targetScale={targetScale}
                    />
                );
            })}
        </section>
    );
};

export default Process;
