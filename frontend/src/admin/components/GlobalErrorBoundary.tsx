import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';

interface ErrorFallbackProps {
    error: any;
    resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
    const { t } = useTranslation();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--admin-card-bg)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            color: '#fff',
            textAlign: 'center',
            margin: '1rem',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: '#ef4444'
            }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            </div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>{t('error.boundary.title', 'Something went wrong')}</h2>
            <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.875rem', maxWidth: '400px' }}>
                {error.message || t('error.boundary.message', 'An unexpected error occurred in this component.')}
            </p>
            <button
                onClick={resetErrorBoundary}
                style={{
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
                onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
            >
                {t('error.boundary.retry', 'Try Again')}
            </button>
        </div>
    );
};

export const GlobalErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
        </ErrorBoundary>
    );
};
