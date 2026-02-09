import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '4rem 0',
            borderTop: '1px solid #222',
            borderRadius: '40px 40px 0 0', // Curve top only
            marginTop: '-40px', // Negative margin to pull up against previous section if desired, or just standard
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{
                maxWidth: 'var(--spacing-container)',
                margin: '0 auto',
                padding: '0 var(--spacing-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '2rem'
            }}>
                <div>
                    <img src="/logo.png" alt="Alberto Farah" style={{ height: '120px', marginBottom: '1rem' }} />
                    <p style={{ color: '#666' }}>© 2025 All Rights Reserved.</p>
                </div>

                <div style={{ display: 'flex', gap: '2rem' }}>
                    <a href="#" style={{ color: '#fff', fontWeight: 600 }}>LinkedIn</a>
                    <a href="#" style={{ color: '#fff', fontWeight: 600 }}>Instagram</a>
                    <a href="#" style={{ color: '#fff', fontWeight: 600 }}>Email</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
