import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import SEO from './SEO';

const API_BASE = import.meta.env.VITE_API_URL || '';

const ContactPage: React.FC = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await axios.post(`${API_BASE}/api/leads/contact`, formData);
            setSubmitted(true);
            setFormData({ name: '', email: '', company: '', message: '' });
        } catch (err: any) {
            setError(err.response?.data?.message || t('contact.somethingWrong'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ paddingTop: '150px', minHeight: '100vh', paddingBottom: '100px' }}>
            <SEO title="Contact" description="Get in touch with us to start your next extraordinary digital project." />
            {/* Hero Section */}
            <section style={{
                padding: '0 var(--spacing-lg)',
                maxWidth: 'var(--spacing-container)',
                margin: '0 auto 100px auto',
                borderBottom: '1px solid #333',
                paddingBottom: '50px'
            }}>
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{
                        fontSize: 'clamp(3rem, 8vw, 6rem)',
                        fontWeight: 900,
                        lineHeight: 0.9,
                        letterSpacing: '-0.02em',
                        marginBottom: '30px',
                        textTransform: 'uppercase'
                    }}
                >
                    {t('contact.heroTitle')}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ fontSize: '1.5rem', color: '#999', maxWidth: '600px' }}
                >
                    {t('contact.heroSubtitle')}
                </motion.p>
            </section>

            {/* Split Layout: Info & Form */}
            <section style={{
                padding: '0 var(--spacing-lg)',
                maxWidth: 'var(--spacing-container)',
                margin: '0 auto'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>

                    {/* Left: Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>{t('contact.getInTouch')}</h3>

                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ fontSize: '1rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>{t('contact.emailLabel')}</h4>
                            <a href="mailto:albertofarah6@gmail.com" style={{ fontSize: '1.5rem', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
                                albertofarah6@gmail.com
                            </a>
                        </div>

                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ fontSize: '1rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>{t('contact.socials')}</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <a href="https://www.linkedin.com/in/alberto-farah-blair-a7b1a45a/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.2rem', color: '#fff', textDecoration: 'none' }}>LinkedIn ↗</a>
                            </div>
                        </div>

                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ fontSize: '1rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>{t('contact.location')}</h4>
                            <p style={{ fontSize: '1.2rem', color: '#ccc' }}>{t('contact.locationValue')}</p>
                        </div>
                    </motion.div>

                    {/* Right: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    textAlign: 'center',
                                    padding: '4rem 2rem',
                                    backgroundColor: 'rgba(39, 201, 63, 0.05)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(39, 201, 63, 0.2)'
                                }}
                            >
                                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</p>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('contact.messageSent')}</h3>
                                <p style={{ color: '#888' }}>{t('contact.responseMessage')}</p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    style={{
                                        marginTop: '1.5rem',
                                        padding: '0.8rem 2rem',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #333',
                                        borderRadius: '30px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {t('contact.sendAnother')}
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label htmlFor="name" style={{ fontSize: '0.9rem', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>{t('contact.name')}</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid #333',
                                            padding: '1rem 0',
                                            color: '#fff',
                                            fontSize: '1.2rem',
                                            outline: 'none'
                                        }}
                                        placeholder={t('contact.placeholder.name')}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label htmlFor="email" style={{ fontSize: '0.9rem', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>{t('contact.email')}</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid #333',
                                            padding: '1rem 0',
                                            color: '#fff',
                                            fontSize: '1.2rem',
                                            outline: 'none'
                                        }}
                                        placeholder={t('contact.placeholder.email')}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label htmlFor="company" style={{ fontSize: '0.9rem', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>{t('contact.company')} <span style={{ color: '#444', fontWeight: 400 }}>{t('contact.optional')}</span></label>
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid #333',
                                            padding: '1rem 0',
                                            color: '#fff',
                                            fontSize: '1.2rem',
                                            outline: 'none'
                                        }}
                                        placeholder={t('contact.placeholder.company')}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label htmlFor="message" style={{ fontSize: '0.9rem', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>{t('contact.message')}</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid #333',
                                            padding: '1rem 0',
                                            color: '#fff',
                                            fontSize: '1.2rem',
                                            outline: 'none',
                                            resize: 'vertical'
                                        }}
                                        placeholder={t('contact.placeholder.message')}
                                    />
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{ color: '#ff5f56', fontSize: '0.9rem' }}
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        marginTop: '2rem',
                                        padding: '1.2rem 3rem',
                                        backgroundColor: submitting ? '#555' : '#fff',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '50px',
                                        fontSize: '1rem',
                                        fontWeight: 800,
                                        cursor: submitting ? 'wait' : 'pointer',
                                        width: 'fit-content',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {submitting ? t('contact.sending') : t('contact.send')}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
