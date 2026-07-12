import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from './SEO';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isEs = i18n.language.startsWith('es');

    return (
        <div style={{ paddingTop: '150px', minHeight: '100vh', paddingBottom: '100px', padding: '150px var(--spacing-lg) 100px var(--spacing-lg)' }}>
            <SEO 
                title={t('legal.privacyTitle')} 
                description={isEs ? 'Política de privacidad y protección de datos.' : 'Privacy policy and data protection.'} 
            />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ maxWidth: '800px', margin: '0 auto', color: '#ccc', lineHeight: 1.8, fontFamily: 'var(--font-family, Figtree), sans-serif' }}
            >
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', marginBottom: '20px', fontWeight: 900 }}>
                    {t('legal.privacyTitle')}
                </h1>
                <p style={{ marginBottom: '40px', color: '#888' }}>
                    {t('legal.privacyUpdated')}
                </p>

                <h2 style={{ color: '#A3FF00', marginTop: '40px', marginBottom: '16px' }}>{t('legal.privacy1Title')}</h2>
                <p>{t('legal.privacy1Text')}</p>

                <h2 style={{ color: '#A3FF00', marginTop: '40px', marginBottom: '16px' }}>{t('legal.privacy2Title')}</h2>
                <p>{t('legal.privacy2Text')}</p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px' }}>
                    <li>{t('legal.privacy2List1')}</li>
                    <li>{t('legal.privacy2List2')}</li>
                    <li>{t('legal.privacy2List3')}</li>
                    <li>{t('legal.privacy2List4')}</li>
                </ul>

                <h2 style={{ color: '#A3FF00', marginTop: '40px', marginBottom: '16px' }}>{t('legal.privacy3Title')}</h2>
                <p>{t('legal.privacy3Text')}</p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px' }}>
                    <li>{t('legal.privacy3List1')}</li>
                    <li>{t('legal.privacy3List2')}</li>
                    <li>{t('legal.privacy3List3')}</li>
                </ul>

                <h2 style={{ color: '#A3FF00', marginTop: '40px', marginBottom: '16px' }}>{t('legal.privacy4Title')}</h2>
                <p>{t('legal.privacy4Text')}</p>

                <h2 style={{ color: '#A3FF00', marginTop: '40px', marginBottom: '16px' }}>{t('legal.privacy5Title')}</h2>
                <p>{t('legal.privacy5Text')}</p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px' }}>
                    <li>{t('legal.privacy5List1')}</li>
                    <li>{t('legal.privacy5List2')}</li>
                    <li>{t('legal.privacy5List3')}</li>
                    <li>{t('legal.privacy5List4')}</li>
                </ul>
                <p><strong>{t('legal.privacy5Contact')}</strong></p>
            </motion.div>
        </div>
    );
};

export default PrivacyPolicy;
