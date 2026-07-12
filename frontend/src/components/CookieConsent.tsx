import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Cookie, X } from 'lucide-react';

const CookieConsent: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Delay showing the banner slightly for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }

        const handleOpenConsent = () => setIsVisible(true);
        window.addEventListener('openCookieConsent', handleOpenConsent);
        return () => window.removeEventListener('openCookieConsent', handleOpenConsent);
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
        // Here you would initialize GTM or GA4
        if (typeof window !== 'undefined' && (window as any).initializeAnalytics) {
            (window as any).initializeAnalytics();
        }
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        left: '24px',
                        right: '24px',
                        maxWidth: '500px',
                        margin: '0 auto',
                        background: 'linear-gradient(145deg, rgba(26,26,26,0.95) 0%, rgba(10,10,10,0.98) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.02)',
                        backdropFilter: 'blur(20px)',
                        zIndex: 9999,
                        color: '#fff',
                        fontFamily: 'var(--font-family, Figtree), sans-serif',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}
                >
                    <button
                        onClick={handleDecline}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'transparent',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <X size={18} />
                    </button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(163,255,0,0.1)', padding: '10px', borderRadius: '12px', color: '#A3FF00' }}>
                            <Cookie size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                            {i18n.language.startsWith('es') ? 'Valoramos tu privacidad' : 'We value your privacy'}
                        </h3>
                    </div>

                    <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                        {i18n.language.startsWith('es') 
                            ? 'Usamos cookies esenciales para que el sitio funcione, y cookies opcionales para entender cómo lo usas y mejorar nuestros servicios (GDPR / CCPA compliant).' 
                            : 'We use essential cookies to make our site work, and optional cookies to understand how you use it and improve our services (GDPR / CCPA compliant).'}
                    </p>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                        <button
                            onClick={handleDecline}
                            style={{
                                flex: 1,
                                padding: '12px 20px',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            {i18n.language.startsWith('es') ? 'Solo esenciales' : 'Essential only'}
                        </button>
                        <motion.button
                            onClick={handleAccept}
                            style={{
                                flex: 1,
                                padding: '12px 20px',
                                background: '#A3FF00',
                                border: 'none',
                                color: '#000',
                                borderRadius: '8px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'transform 0.1s, opacity 0.2s',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
                            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                            whileTap={{ scale: 0.98 }}
                        >
                            {i18n.language.startsWith('es') ? 'Aceptar todas' : 'Accept all'}
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
