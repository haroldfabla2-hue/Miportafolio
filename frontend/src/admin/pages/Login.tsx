import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../styles/admin.css';

const FALLBACK_GOOGLE_CLIENT_ID = '228619635923-0jtm5nl5fiqovu1fhchm552vf0rnp4bk.apps.googleusercontent.com';
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || FALLBACK_GOOGLE_CLIENT_ID;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLoginSuccess = (token: string, user: any, refreshToken?: string) => {
        login(token, user, refreshToken);
        // Role-based redirection
        if (user.role === 'CLIENT') {
            // For clients, we might want to redirect to a portal or just home for now
            // User asked for "correct interface", assuming /admin is correct for now or maybe we'll refine later.
            navigate('/admin');
        } else {
            navigate('/admin');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            handleLoginSuccess(response.data.access_token, response.data.user, response.data.refresh_token);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Only initialize Google login if client ID is configured
    const googleLogin = googleClientId ? useGoogleLogin({
        onSuccess: async (codeResponse) => {
            setIsLoading(true);
            try {
                const response = await api.post('/auth/google', {
                    code: codeResponse.code,
                });
                handleLoginSuccess(response.data.access_token, response.data.user, response.data.refresh_token);
            } catch (err: any) {
                console.error('Google login error:', err);
                setError(err.response?.data?.message || 'Google login failed');
                setIsLoading(false);
            }
        },
        onError: () => {
            setError('Google login failed');
            setIsLoading(false);
        },
        flow: 'auth-code',
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/contacts',
    }) : null;

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'var(--font-family)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px'
            }}>
                {/* Logo & Title */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, var(--color-accent), #6366f1)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: '#000'
                    }}>
                        I
                    </div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: '#fff',
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.02em'
                    }}>
                        Iris CRM
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: '#666'
                    }}>
                        Sign in to your account
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={{
                    background: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border-color)',
                    borderRadius: '20px',
                    padding: '2rem'
                }}>
                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '10px',
                            padding: '0.875rem 1rem',
                            marginBottom: '1.5rem',
                            color: '#ef4444',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#888',
                            marginBottom: '0.5rem'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'var(--admin-bg)',
                                border: '1px solid var(--admin-border-color)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#888',
                            marginBottom: '0.5rem'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'var(--admin-bg)',
                                border: '1px solid var(--admin-border-color)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'var(--color-accent)',
                            border: 'none',
                            borderRadius: '10px',
                            color: '#000',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            transition: 'all 0.2s',
                            marginBottom: '1rem'
                        }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--admin-border-color)' }} />
                        <span style={{ color: '#555', fontSize: '0.8rem' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--admin-border-color)' }} />
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (!googleLogin) {
                                setError('Google Sign-In is not configured. Contact support.');
                                return;
                            }
                            googleLogin();
                        }}
                        disabled={!googleLogin}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'transparent',
                            border: '1px solid var(--admin-border-color)',
                            borderRadius: '10px',
                            color: googleLogin ? '#fff' : '#888',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            cursor: googleLogin ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.2s',
                            opacity: googleLogin ? 1 : 0.7
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                </form>

                {/* Footer */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    color: '#555',
                    fontSize: '0.875rem'
                }}>
                    Powered by <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Iris CRM</span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
