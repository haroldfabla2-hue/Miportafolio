import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import api from '../services/api';

// Define User Interface matching backend
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'WORKER' | 'CLIENT';
    avatar: string;
    googleConnected?: boolean;
    onboardingCompleted?: boolean;
    permissions?: string[];
    workerRole?: {
        id: string;
        name: string;
        color: string;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    permissions: string[];
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    login: (token: string, user: User, refreshToken?: string) => void;
    logout: () => void;
    refreshSession: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [token, setToken] = useState<string | null>(localStorage.getItem('iris_token'));
    // Store refresh token in state, initialize from storage
    const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('iris_refresh_token'));
    const [isLoading, setIsLoading] = useState(true);

    // Initial session check
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('iris_token');
            const storedRefresh = localStorage.getItem('iris_refresh_token');

            if (storedToken) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                    setPermissions(res.data.permissions || []);
                } catch (error: any) {
                    console.error('Session invalid, trying refresh:', error);
                    // Try to refresh if we have a refresh token
                    if (storedRefresh && (error.response?.status === 401 || error.response?.status === 500)) {
                        try {
                            const refreshRes = await api.post('/auth/refresh', { refreshToken: storedRefresh });
                            const { access_token, refresh_token: newRefresh, user: refreshedUser } = refreshRes.data;

                            login(access_token, refreshedUser, newRefresh);
                            return; // Login handles state update
                        } catch (refreshError) {
                            console.error('Refresh failed:', refreshError);
                            logout();
                        }
                    } else {
                        logout();
                    }
                }
            } else if (storedRefresh) {
                // No access token but we have refresh token (edge case)
                try {
                    const refreshRes = await api.post('/auth/refresh', { refreshToken: storedRefresh });
                    const { access_token, refresh_token: newRefresh, user: refreshedUser } = refreshRes.data;
                    login(access_token, refreshedUser, newRefresh);
                    setIsLoading(false);
                    return;
                } catch (refreshError) {
                    logout();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = (newToken: string, newUser: User, newRefreshToken?: string) => {
        localStorage.setItem('iris_token', newToken);
        setToken(newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        if (newRefreshToken) {
            localStorage.setItem('iris_refresh_token', newRefreshToken);
            setRefreshToken(newRefreshToken);
        }

        setUser(newUser);
        setPermissions(newUser.permissions || []);
    };

    const logout = () => {
        localStorage.removeItem('iris_token');
        localStorage.removeItem('iris_refresh_token');
        delete api.defaults.headers.common['Authorization'];
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        setPermissions([]);
    };

    // Manual refresh check
    const refreshSession = async () => {
        if (!token) return;
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
            setPermissions(res.data.permissions || []);
        } catch (error) {
            // Optional: Auto-refresh here too if wanted, but initAuth covers the main "persistence" case
            logout();
        }
    };

    const hasPermission = useCallback((permission: string): boolean => {
        return permissions.includes(permission);
    }, [permissions]);

    const hasAnyPermission = useCallback((perms: string[]): boolean => {
        return perms.some(p => permissions.includes(p));
    }, [permissions]);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Wrap with GoogleOAuthProvider only if client ID is available
    const content = googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
            {children}
        </GoogleOAuthProvider>
    ) : (
        <>{children}</>
    );

    return (
        <AuthContext.Provider value={{
            user,
            token,
            permissions,
            isAuthenticated: !!user,
            isAdmin,
            isLoading,
            login,
            logout,
            refreshSession,
            hasPermission,
            hasAnyPermission,
        }}>
            {content}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

