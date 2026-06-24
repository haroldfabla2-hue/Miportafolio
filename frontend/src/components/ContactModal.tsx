import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
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
        alert(t('contact.modal.alert'));
        setFormData({ name: '', email: '', message: '' });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop & Container */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(5px)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px' // Prevent touching edges
                        }}
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                backgroundColor: '#111',
                                border: '1px solid #333',
                                borderRadius: '30px',
                                padding: '3rem',
                                position: 'relative',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                        >
                            <button
                                onClick={onClose}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#666',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕
                            </button>

                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 800 }}>{t('contact.modal.title')}</h2>
                            <p style={{ color: '#999', marginBottom: '2rem' }}>{t('contact.modal.subtitle')}</p>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>{t('contact.modal.nameLabel')}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            backgroundColor: '#1a1a1a',
                                            border: '1px solid #333',
                                            borderRadius: '10px',
                                            padding: '1rem',
                                            color: '#fff',
                                            outline: 'none'
                                        }}
                                        placeholder={t('contact.modal.namePlaceholder')}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>{t('contact.modal.emailLabel')}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            backgroundColor: '#1a1a1a',
                                            border: '1px solid #333',
                                            borderRadius: '10px',
                                            padding: '1rem',
                                            color: '#fff',
                                            outline: 'none'
                                        }}
                                        placeholder={t('contact.modal.emailPlaceholder')}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>{t('contact.modal.detailsLabel')}</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={3}
                                        style={{
                                            backgroundColor: '#1a1a1a',
                                            border: '1px solid #333',
                                            borderRadius: '10px',
                                            padding: '1rem',
                                            color: '#fff',
                                            outline: 'none',
                                            resize: 'none'
                                        }}
                                        placeholder={t('contact.modal.detailsPlaceholder')}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        marginTop: '1rem',
                                        padding: '1rem',
                                        backgroundColor: 'var(--color-accent)',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '50px',
                                        fontSize: '1rem',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {t('contact.modal.submit')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ContactModal;
