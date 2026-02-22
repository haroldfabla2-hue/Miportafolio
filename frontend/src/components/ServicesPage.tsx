import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import SEO from './SEO';

// Services data
const services = [
    {
        title: "Web Design",
        description: "Crafting visually stunning and user-centric interfaces. I focus on aesthetic excellence paired with intuitive functionality to create digital experiences that captivate and convert.",
        tags: ["UI/UX", "Art Direction", "Prototyping", "Design Systems"]
    },
    {
        title: "Web Development",
        description: "Bringing designs to life with clean, robust, and scalable code. Specializing in modern React ecosystems, animation libraries, and performance-first architecture.",
        tags: ["React/Vite", "TypeScript", "GSAP/Framer Motion", "WebGL"]
    },
    {
        title: "Branding & Strategy",
        description: "Defining the core identity of your business. From logo design to comprehensive brand guidelines, I help build brands that resonate and endure.",
        tags: ["Logo Design", "Brand Identity", "Strategy", "Visual Language"]
    }
];

// Process data
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

// Process Card Component
interface ProcessCardProps {
    item: typeof steps[0];
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
            }}>
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

// Services Page Component
const ServicesPage: React.FC = () => {
    const servicesContainer = useRef<HTMLDivElement>(null);
    const processContainer = useRef<HTMLDivElement>(null);
    
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
            <SEO title="Expertise" description="Comprehensive digital services designed to elevate your brand." />
            
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
                    Expertise & <br /> Solutions
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ fontSize: '1.5rem', color: '#999', maxWidth: '600px' }}
                >
                    A comprehensive suite of digital services designed to elevate your brand.
                </motion.p>
            </section>

            {/* Services Cards */}
            <section ref={servicesContainer} style={{ marginBottom: '20vh' }}>
                {services.map((service, i) => {
                    const targetScale = 1 - ((services.length - i) * 0.05);
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
                                backgroundColor: 'var(--color-bg)',
                                borderRadius: '25px',
                                padding: 'clamp(2rem, 5vw, 4rem)',
                                width: 'clamp(300px, 90vw, 1000px)',
                                height: 'clamp(300px, 60vh, 500px)',
                                border: '1px solid #333',
                                position: 'relative',
                                top: `calc(-5vh + ${i * 25}px)`,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', margin: 0, lineHeight: 1 }}>{service.title}</h2>
                                    <span style={{ fontSize: '1.5rem', color: 'var(--color-accent)', fontFamily: 'monospace' }}>0{i + 1}</span>
                                </div>
                                <div>
                                    <p style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', color: '#999', maxWidth: '600px', lineHeight: 1.5 }}>{service.description}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {service.tags.map(tag => (
                                        <span key={tag} style={{
                                            backgroundColor: '#111',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            border: '1px solid #333',
                                            color: '#888'
                                        }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </section>

            {/* Process Section - WITH ANIMATION */}
            <section ref={processContainer} style={{ marginBottom: '20vh', padding: '0 var(--spacing-lg)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto 100px auto' }}>
                    <h4 style={{ color: 'var(--color-accent)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>My Process</h4>
                    <p style={{ fontSize: '2rem', color: '#fff', maxWidth: '600px' }}>
                        A transparent and collaborative workflow designed to deliver exceptional results.
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
