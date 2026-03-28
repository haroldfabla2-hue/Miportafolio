import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ContactModal from './ContactModal';

const Navbar: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

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
                    padding: '1rem 1.5rem',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    background: navBackground,
                    backdropFilter: navBackdrop,
                    transition: 'all 0.3s ease'
                }}
                className="navbar"
            >
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <img 
                            src="/logo.png" 
                            alt="Alberto Farah" 
                            style={{ 
                                height: '50px', 
                                width: 'auto',
                                objectFit: 'contain'
                            }} 
                            className="navbar-logo"
                        />
                    </motion.div>
                </Link>

                {/* Desktop Navigation */}
                <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {links.map((link, index) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === link.path ? '#A3FF00' : '#888',
                                    fontSize: '0.85rem',
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
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                        }}
                        whileHover={{ background: 'rgba(163, 255, 0, 0.1)', borderColor: '#A3FF00' }}
                        className="lang-btn"
                    >
                        {i18n.language === 'en' ? 'ES' : 'EN'}
                    </motion.button>

                    <Link to="/admin/login" style={{ textDecoration: 'none' }} className="admin-btn-link">
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                backgroundColor: 'transparent',
                                color: '#fff',
                                padding: '0.5rem 1rem',
                                borderRadius: '999px',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                border: '1px solid rgba(255,255,255,0.25)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                            }}
                            whileHover={{ scale: 1.03, borderColor: '#fff' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            CMS
                        </motion.button>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        display: 'none',
                        padding: '0.5rem'
                    }}
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </motion.nav>

            {/* Mobile Menu */}
            <motion.div
                className="mobile-menu"
                initial={false}
                animate={{
                    opacity: isMobileMenuOpen ? 1 : 0,
                    y: isMobileMenuOpen ? 0 : -20
                }}
                style={{
                    position: 'fixed',
                    top: '70px',
                    left: 0,
                    right: 0,
                    background: 'rgba(17, 17, 17, 0.98)',
                    backdropFilter: 'blur(20px)',
                    padding: isMobileMenuOpen ? '2rem' : '0',
                    overflow: 'hidden',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    pointerEvents: isMobileMenuOpen ? 'auto' : 'none'
                }}
            >
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        style={{
                            textDecoration: 'none',
                            color: location.pathname === link.path ? '#A3FF00' : '#fff',
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '0.5rem 0',
                            borderBottom: '1px solid #333'
                        }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {link.name}
                    </Link>
                ))}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button
                        onClick={toggleLanguage}
                        style={{
                            background: 'transparent',
                            border: '1px solid #333',
                            borderRadius: '20px',
                            padding: '0.5rem 1rem',
                            color: '#A3FF00',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                        }}
                    >
                        {i18n.language === 'en' ? 'ES' : 'EN'}
                    </button>
                    <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <button
                            style={{
                                background: 'transparent',
                                color: '#fff',
                                padding: '0.5rem 1rem',
                                borderRadius: '999px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                border: '1px solid rgba(255,255,255,0.25)',
                                textTransform: 'uppercase'
                            }}
                        >
                            CMS
                        </button>
                    </Link>
                </div>
            </motion.div>

            <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default Navbar;
