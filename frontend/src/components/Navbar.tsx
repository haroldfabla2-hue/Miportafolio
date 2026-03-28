import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const location = useLocation();

    const navBackground = useTransform(
        scrollY,
        [0, 50],
        ['rgba(17, 17, 17, 0)', 'rgba(17, 17, 17, 0.8)']
    );

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
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
                    zIndex: 1001,
                    background: navBackground,
                    transition: 'all 0.3s ease'
                }}
            >
                <Link to="/">
                    <img 
                        src="/logo.png" 
                        alt="Alberto Farah" 
                        style={{ height: '50px', width: 'auto', objectFit: 'contain' }} 
                        className="navbar-logo"
                    />
                </Link>

                {/* Desktop Nav */}
                <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {links.map((link) => (
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
                            }}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <button
                        onClick={toggleLanguage}
                        className="lang-btn"
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
                    >
                        {i18n.language === 'en' ? 'ES' : 'EN'}
                    </button>
                    <Link to="/admin/login" className="admin-btn">
                        <button style={{
                            background: 'transparent',
                            color: '#fff',
                            padding: '0.5rem 1rem',
                            borderRadius: '999px',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.25)',
                            textTransform: 'uppercase'
                        }}>
                            CMS
                        </button>
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <button 
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <div 
                className={`mobile-menu ${isMobileMenuOpen ? 'open' : 'hidden'}`}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(17, 17, 17, 0.98)',
                    zIndex: 1000,
                    padding: '6rem 2rem 2rem',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}
            >
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            style={{
                                textDecoration: 'none',
                                color: location.pathname === link.path ? '#A3FF00' : '#fff',
                                fontSize: '1.4rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                padding: '1rem 0',
                                borderBottom: '1px solid #333'
                            }}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button onClick={toggleLanguage} className="lang-btn" style={{
                            background: 'transparent',
                            border: '1px solid #333',
                            borderRadius: '20px',
                            padding: '0.5rem 1rem',
                            color: '#A3FF00',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}>
                            {i18n.language === 'en' ? 'ES' : 'EN'}
                        </button>
                        <Link to="/admin/login">
                            <button style={{
                                background: 'transparent',
                                color: '#fff',
                                padding: '0.5rem 1rem',
                                borderRadius: '999px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                border: '1px solid rgba(255,255,255,0.25)'
                            }}>
                                CMS
                            </button>
                        </Link>
                    </div>
                </div>
        </>
    );
};

export default Navbar;
