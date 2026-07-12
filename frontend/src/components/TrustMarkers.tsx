import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, Award, Server } from 'lucide-react';

const TrustMarkers = () => {
    const { i18n } = useTranslation();
    const isEs = i18n.language.startsWith('es');

    const markers = [
        {
            icon: <ShieldCheck size={28} />,
            title: isEs ? 'Seguridad Enterprise' : 'Enterprise Security',
            desc: isEs ? 'Infraestructura blindada y auditoría continua' : 'Hardened infrastructure & continuous auditing'
        },
        {
            icon: <Lock size={28} />,
            title: isEs ? 'GDPR / CCPA' : 'GDPR / CCPA',
            desc: isEs ? 'Cumplimiento estricto de privacidad de datos' : 'Strict data privacy compliance'
        },
        {
            icon: <Server size={28} />,
            title: isEs ? 'Alta Disponibilidad' : 'High Availability',
            desc: isEs ? 'Arquitectura escalable sin tiempo de inactividad' : 'Scalable architecture with zero downtime'
        },
        {
            icon: <Award size={28} />,
            title: isEs ? 'Calidad Garantizada' : 'Guaranteed Quality',
            desc: isEs ? 'Pruebas exhaustivas y QA en cada entrega' : 'Comprehensive testing & QA on every delivery'
        }
    ];

    return (
        <section style={{ padding: '60px 20px', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <p style={{ color: '#A3FF00', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                        {isEs ? 'Estándares Corporativos' : 'Corporate Standards'}
                    </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                    {markers.map((marker, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                textAlign: 'center',
                                padding: '30px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.03)'
                            }}
                        >
                            <div style={{ color: '#A3FF00', marginBottom: '16px' }}>
                                {marker.icon}
                            </div>
                            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
                                {marker.title}
                            </h4>
                            <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                {marker.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustMarkers;
