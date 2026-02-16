import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => (
    <div
        onClick={onClick}
        className={`glass-card p-6 ${className}`}
    >
        {children}
    </div>
);
