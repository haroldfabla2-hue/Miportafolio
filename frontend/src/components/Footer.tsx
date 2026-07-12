import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isEs = i18n.language.startsWith('es');
    const currentYear = new Date().getFullYear();
    const contactEmail = 'alberto.farah.b@gmail.com';
    
    return (
        <footer style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '4rem 0',
            borderTop: '1px solid #222',
            borderRadius: '40px 40px 0 0',
            marginTop: '-40px',
            position: 'relative',
            zIndex: 10
        }}>
            <div className="footer-content" style={{
                maxWidth: 'var(--spacing-container)',
                margin: '0 auto',
                padding: '0 var(--spacing-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '2rem'
            }}>
                <div>
                    <img src="/logo.png" alt="Alberto Farah" className="footer-logo" style={{ height: '120px', marginBottom: '1rem' }} />
                    <p style={{ color: '#666' }}>© {currentYear} {t('footer.rights')}.</p>
                </div>

                <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <a href="https://linkedin.com/in/alberto-farah-blair" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontWeight: 600 }}>{t('footer.linkedin')}</a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontWeight: 600 }}>{t('footer.instagram')}</a>
                        <a href={`mailto:${contactEmail}`} style={{ color: '#fff', fontWeight: 600 }}>{t('footer.email')}</a>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        <Link to="/privacy" style={{ color: '#888', fontSize: '0.85rem', textDecoration: 'underline' }}>
                            {isEs ? 'Política de Privacidad' : 'Privacy Policy'}
                        </Link>
                        <Link to="/terms" style={{ color: '#888', fontSize: '0.85rem', textDecoration: 'underline' }}>
                            {isEs ? 'Términos de Servicio' : 'Terms of Service'}
                        </Link>
                        <button 
                            onClick={() => window.dispatchEvent(new Event('openCookieConsent'))}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#888', 
                                fontSize: '0.85rem', 
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                padding: 0
                            }}
                        >
                            {isEs ? 'Configuración de Cookies' : 'Cookie Settings'}
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
