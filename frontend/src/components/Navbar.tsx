import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ContactModal from './ContactModal';

const Navbar: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { scrollY } = useScroll();
    const location = useLocation();

    const navBackground = useTransform(
        scrollY,
        [0, 50],
        ['rgba(17, 17, 17, 0)', 'rgba(17, 17, 17, 0.8)']
    );
    const navBackdrop = useTransform(
        scrollY,
        [0, 50],
        ['blur(0px)', 'blur(10px)']
    );

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const links = [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.projects'), path: '/projects' },
        { name: t('nav.services'), path: '/services' },
        { name: t('nav.about'), path: '/about' },
        { name: t('nav.blog'), path: '/blog' },
        { name: t('nav.contact'), path: '/contact' },
    ];

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'es' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <>
            <motion.nav
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem 4rem',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    background: navBackground,
                    backdropFilter: navBackdrop,
                    transition: 'all 0.3s ease'
                }}
            >
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: '#fff',
                            letterSpacing: '-0.02em',
                            textTransform: 'uppercase'
                        }}
                    >
                        Alberto<span style={{ color: '#A3FF00' }}>.farah</span>
                    </motion.div>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        {links.map((link, index) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === link.path ? '#A3FF00' : '#888',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    transition: 'color 0.3s'
                                }}
                            >
                                <motion.span
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = location.pathname === link.path ? '#A3FF00' : '#888'}
                                >
                                    {link.name}
                                </motion.span>
                            </Link>
                        ))}
                    </div>

                    {/* Language Switcher */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={toggleLanguage}
                        style={{
                            background: 'transparent',
                            border: '1px solid #333',
                            borderRadius: '20px',
                            padding: '0.4rem 0.8rem',
                            color: '#A3FF00',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                        }}
                        whileHover={{ background: 'rgba(163, 255, 0, 0.1)', borderColor: '#A3FF00' }}
                    >
                        {i18n.language === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}
                    </motion.button>
                </div>
            </motion.nav>

            <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default Navbar;
