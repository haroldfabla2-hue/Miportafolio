import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();
    const contactEmail = 'alberto.farah.b@gmail.com';
    
    return (
        <footer style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '4rem 0',
            borderTop: '1px solid #222',
            borderRadius: '40px 40px 0 0', // Curve top only
            marginTop: '-40px', // Negative margin to pull up against previous section if desired, or just standard
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{
                maxWidth: 'var(--spacing-container)',
                margin: '0 auto',
                padding: '0 var(--spacing-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '2rem'
            }}>
                <div>
                    <img src="/logo.png" alt="Alberto Farah" style={{ height: '120px', marginBottom: '1rem' }} />
                    <p style={{ color: '#666' }}>© {currentYear} {t('footer.rights')}.</p>
                </div>

                <div style={{ display: 'flex', gap: '2rem' }}>
                    <a href="https://linkedin.com/in/alberto-farah-blair" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontWeight: 600 }}>{t('footer.linkedin')}</a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontWeight: 600 }}>{t('footer.instagram')}</a>
                    <a href={`mailto:${contactEmail}`} style={{ color: '#fff', fontWeight: 600 }}>{t('footer.email')}</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
