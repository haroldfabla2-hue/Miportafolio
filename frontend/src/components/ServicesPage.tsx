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
            title: "Desarrollo SaaS Custom",
            description: "Construyo plataformas B2B escalables a medida. Desde sistemas de gestión y CRMs hasta marketplaces con infraestructuras robustas.",
            tags: ["React/Node", "Arquitectura Cloud", "Sistemas Core", "Escalabilidad"]
        },
        {
            title: "Agentes IA (Atención 24/7)",
            description: "Implemento agentes de inteligencia artificial que atienden por WhatsApp y Web. Califican leads, agendan citas y reducen el trabajo manual.",
            tags: ["Automatización", "NLP", "WhatsApp API", "Reducción de Costos"]
        },
        {
            title: "Websites + Reservas",
            description: "Diseño sitios web premium integrados con motores de reservas y calendarios sincronizados. Interfaz de alto nivel y cero fricción.",
            tags: ["UX/UI Premium", "Sistemas de Booking", "Conversión", "Pagos"]
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

            {/* AI Solutions Section (Added from 30-Day Strategy) */}
            <section style={{ marginBottom: '20vh', padding: '0 var(--spacing-lg)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: 'rgba(20,20,20,0.6)', border: '1px solid rgba(163,255,0,0.2)', borderRadius: '25px', padding: 'clamp(2rem, 5vw, 4rem)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(163,255,0,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1.5rem' }}>🤖</span>
                        </div>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: 0, color: '#fff' }}>Soluciones de IA y Automatización</h2>
                    </div>
                    
                    <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '3rem', maxWidth: '800px', lineHeight: 1.6 }}>
                        Ayudo a freelancers, agencias y negocios digitales a hacer en horas lo que antes tomaba semanas. Construyo sistemas cognitivos, flujos automatizados (no-code/low-code) y micro-SaaS a medida.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
                        <div>
                            <h3 style={{ color: 'var(--color-accent)', marginBottom: '1rem', fontSize: '1.2rem' }}>Problemas Típicos</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li style={{ display: 'flex', gap: '10px' }}><span>❌</span> Procesos manuales repetitivos que roban horas vitales a tu equipo.</li>
                                <li style={{ display: 'flex', gap: '10px' }}><span>❌</span> Uso de documentos y contratos improvisados que exponen a tu negocio.</li>
                                <li style={{ display: 'flex', gap: '10px' }}><span>❌</span> Cuellos de botella graves en el onboarding o soporte de clientes.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.2rem' }}>Resultados Obtenidos</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li style={{ display: 'flex', gap: '10px' }}><span>✅</span> Flujos de trabajo invisibles que operan 24/7 sin intervención humana.</li>
                                <li style={{ display: 'flex', gap: '10px' }}><span>✅</span> Infraestructura cognitiva (Agentes IA) conectada a tus propios datos.</li>
                                <li style={{ display: 'flex', gap: '10px' }}><span>✅</span> Capacidad de escalar el volumen de clientes sin multiplicar tus costos.</li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Proyectos Destacados</h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <a href="https://github.com/AlbertoFarah/contract-generator-svc" target="_blank" rel="noreferrer" style={{ padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                                📄 Contract Generator SaaS
                            </a>
                            <a href="https://github.com/AlbertoFarah/Silhouette-Agency-OS-OpenSource" target="_blank" rel="noreferrer" style={{ padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                                🧠 Silhouette Agency OS
                            </a>
                        </div>
                        
                        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                            <a href="/contact" style={{ display: 'inline-block', padding: '15px 30px', backgroundColor: 'var(--color-accent)', color: '#000', fontWeight: 'bold', borderRadius: '30px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Hablemos de tu automatización
                            </a>
                        </div>
                    </div>
                </div>
            </section>
            {/* Impact & Case Studies Section */}
            <section style={{ marginBottom: '20vh', padding: '0 var(--spacing-lg)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: 0, color: '#fff', fontWeight: 900 }}>Impacto Real <span style={{ color: 'var(--color-accent)' }}>B2B</span></h2>
                        <p style={{ color: '#999', fontSize: '1.2rem', marginTop: '1rem' }}>Sistemas implementados operando en producción.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* Case 1 */}
                        <div style={{ backgroundColor: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2rem', backdropFilter: 'blur(10px)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Clínica (Healthcare)</h3>
                            <div style={{ color: 'var(--color-accent)', fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>-7% No-shows</div>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                <strong>Problema:</strong> El equipo colapsaba respondiendo leads (+42 horas de retraso).<br/><br/>
                                <strong>Solución:</strong> Despliegue de Agente IA por WhatsApp con sincronización de calendarios.<br/><br/>
                                <strong>Resultado:</strong> Tiempo de respuesta reducido a 2 minutos. +34% en nuevas reservas automáticas y 14 horas semanales liberadas para el equipo médico.
                            </p>
                        </div>

                        {/* Case 2 */}
                        <div style={{ backgroundColor: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2rem', backdropFilter: 'blur(10px)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Red Inmobiliaria (Real Estate)</h3>
                            <div style={{ color: 'var(--color-accent)', fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>+47% Cierres</div>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                <strong>Problema:</strong> 80% de leads de portales no calificados, desperdiciando 12h/día de los brokers.<br/><br/>
                                <strong>Solución:</strong> Sistema de Pre-screening IA e integración profunda con CRM.<br/><br/>
                                <strong>Resultado:</strong> Calificación de leads en 3 minutos (61% de tasa de calificación). Eficiencia del equipo mejorada de 8h a 2h al día filtrando leads.
                            </p>
                        </div>

                        {/* Case 3 */}
                        <div style={{ backgroundColor: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2rem', backdropFilter: 'blur(10px)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Agencia de Marketing (B2B)</h3>
                            <div style={{ color: 'var(--color-accent)', fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>$12K/mes MRR</div>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                <strong>Problema:</strong> Querían escalar servicios sin contratar desarrolladores costosos.<br/><br/>
                                <strong>Solución:</strong> Desarrollo de SaaS White-label para despliegue automatizado de clientes.<br/><br/>
                                <strong>Resultado:</strong> 12 clientes desplegados en 30 días con captura de leads 24/7. Retorno de inversión en menos de 3 meses.
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
