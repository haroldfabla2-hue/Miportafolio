import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from './SEO';
import { motion } from 'framer-motion';

const TermsOfService: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isEs = i18n.language.startsWith('es');

    return (
        <div style={{ paddingTop: '150px', minHeight: '100vh', paddingBottom: '100px', padding: '150px var(--spacing-lg) 100px var(--spacing-lg)' }}>
            <SEO 
                title={t('legal.termsTitle')} 
                description={isEs ? 'Términos y condiciones de servicio B2B.' : 'B2B terms and conditions of service.'} 
            />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ maxWidth: '800px', margin: '0 auto', color: '#ccc', lineHeight: 1.8, fontFamily: 'var(--font-family, Figtree), sans-serif' }}
            >
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', marginBottom: '20px', fontWeight: 900 }}>
                    {t('legal.termsTitle')}
                </h1>
                <p style={{ marginBottom: '40px', color: '#888' }}>
                    {t('legal.termsUpdated')}
                </p>

                <h2 style={{ color: '#A3FF00', marginTop: '40px', marginBottom: '16px' }}>{t('legal.terms1Title')}</h2>
                <p>{t('legal.terms1Text')}</p>

                <h2 style={{ color: '#A3FF00', marginTop: '40px', marginBottom: '16px' }}>{t('legal.terms2Title')}</h2>
                <p>{t('legal.terms2Text')}</p>

                <h2 style={{ color: '#A3FF00', marginTop: '40px', marginBottom: '16px' }}>{t('legal.terms3Title')}</h2>
                <p>{t('legal.terms3Text')}</p>

                <h2 style={{ color: '#A3FF00', marginTop: '40px', marginBottom: '16px' }}>{t('legal.terms4Title')}</h2>
                <p>{t('legal.terms4Text')}</p>
                
                <h2 style={{ color: '#A3FF00', marginTop: '40px', marginBottom: '16px' }}>{t('legal.terms5Title')}</h2>
                <p>{t('legal.terms5Text')}</p>
            </motion.div>
        </div>
    );
};

export default TermsOfService;
