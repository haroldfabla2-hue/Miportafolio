import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const ContactPage: React.FC = () => {
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
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ paddingTop: '150px', minHeight: '100vh', paddingBottom: '100px' }}>
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
                    Let's <br /> Talk
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ fontSize: '1.5rem', color: '#999', maxWidth: '600px' }}
                >
                    Have a project in mind? Let's build something extraordinary together.
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
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Get in Touch</h3>

                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ fontSize: '1rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Email</h4>
                            <a href="mailto:albertofarah6@gmail.com" style={{ fontSize: '1.5rem', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
                                albertofarah6@gmail.com
                            </a>
                        </div>

                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ fontSize: '1rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Socials</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <a href="https://www.linkedin.com/in/alberto-farah-blair-a7b1a45a/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.2rem', color: '#fff', textDecoration: 'none' }}>LinkedIn ↗</a>
                            </div>
                        </div>

                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ fontSize: '1rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Location</h4>
                            <p style={{ fontSize: '1.2rem', color: '#ccc' }}>Arequipa, Peru (Available Worldwide)</p>
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
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Message Sent!</h3>
                                <p style={{ color: '#888' }}>I'll get back to you as soon as possible.</p>
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
                                    Send Another Message
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label htmlFor="name" style={{ fontSize: '0.9rem', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Name</label>
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
                                        placeholder="What's your name?"
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label htmlFor="email" style={{ fontSize: '0.9rem', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Email</label>
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
                                        placeholder="Your email address"
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label htmlFor="company" style={{ fontSize: '0.9rem', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Company <span style={{ color: '#444', fontWeight: 400 }}>(Optional)</span></label>
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
                                        placeholder="Your company name"
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label htmlFor="message" style={{ fontSize: '0.9rem', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Message</label>
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
                                        placeholder="Tell me about your project..."
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
                                    {submitting ? 'Sending...' : 'Send Message'}
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
