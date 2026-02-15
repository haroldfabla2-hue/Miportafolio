import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ContactModal from './ContactModal';

const Navbar: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { scrollY } = useScroll();
    const location = useLocation();

    // Transform opacity/blur based on scroll
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
        { name: 'Home', path: '/' },
        { name: 'Projects', path: '/projects' },
        { name: 'Services', path: '/services' },
        { name: 'About', path: '/about' },
        { name: 'Blog', path: '/blog' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <>
            <motion.nav
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.2rem var(--spacing-lg)',
                    fontFamily: 'var(--font-family)',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    backgroundColor: navBackground,
                    backdropFilter: navBackdrop,
                    borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
            >
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="logo"
                        style={{
                            zIndex: 101,
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <img
                            src="/logo.png"
                            alt="Alberto Farah"
                            style={{
                                height: '60px',
                                width: 'auto'
                            }}
                        />
                    </motion.div>
                </Link>

                {/* Desktop Links */}
                <ul style={{ display: 'flex', gap: '3rem', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0 }}>
                    {links.map((link, i) => (
                        <motion.li
                            key={link.name}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                        >
                            <Link
                                to={link.path}
                                style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    color: location.pathname === link.path ? 'var(--color-accent)' : '#fff',
                                    opacity: location.pathname === link.path ? 1 : 0.8,
                                    position: 'relative',
                                    textDecoration: 'none',
                                    transition: 'color 0.3s'
                                }}
                                className="nav-link"
                            >
                                {link.name}
                            </Link>
                        </motion.li>
                    ))}
                </ul>

                {/* Right Actions: CTA & Login */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => isAuthenticated ? navigate('/admin') : navigate('/admin/login')}
                        style={{
                            backgroundColor: 'transparent',
                            color: '#fff',
                            padding: '0.8rem 1.2rem',
                            borderRadius: '50px',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.2)',
                            transition: 'all 0.2s',
                        }}
                        whileHover={{ scale: 1.05, borderColor: '#fff' }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isAuthenticated ? 'Dashboard' : 'Log In'}
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            backgroundColor: 'var(--color-accent)',
                            color: '#000',
                            padding: '0.8rem 1.6rem',
                            borderRadius: '50px',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            border: 'none'
                        }}
                        whileHover={{ scale: 1.05, backgroundColor: '#fff' }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Start Your Project
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" dangerouslySetInnerHTML={{ __html: '<path d="M1 11L11 1M11 1H1M11 1V11" stroke="currentColor" stroke-width="2" stroke-line-cap="round" stroke-line-join="round"/>' }} />
                    </motion.button>
                </div>
            </motion.nav>
            <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default Navbar;
