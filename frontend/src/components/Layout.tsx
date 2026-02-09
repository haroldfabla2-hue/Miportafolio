import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="layout" style={{
            maxWidth: 'var(--spacing-container)',
            margin: '0 auto',
            padding: '0 var(--spacing-lg)',
            position: 'relative' // For absolute positioning context if needed
        }}>
            {children}
        </div>
    );
};

export default Layout;
