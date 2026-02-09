import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically handle form submission
        alert("Thanks for reaching out! I'll get back to you soon.");
        setFormData({ name: '', email: '', message: '' });
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

                            <button
                                type="submit"
                                style={{
                                    marginTop: '2rem',
                                    padding: '1.2rem 3rem',
                                    backgroundColor: '#fff',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontSize: '1rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    width: 'fit-content'
                                }}
                            >
                                Send Message
                            </button>
                        </form>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
