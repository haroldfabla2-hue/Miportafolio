import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Shield, Check, Lock, AlertCircle } from 'lucide-react';

const JoinPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [inviteData, setInviteData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (!token) {
            setError('Invalid invitation link');
            setLoading(false);
            return;
        }
        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        try {
            const response = await api.get(`/auth/invite/${token}`);
            setInviteData(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Expired or invalid invitation');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setVerifying(true);
        setError(null);

        try {
            const response = await api.post('/auth/complete-invite', {
                token,
                password: formData.password
            });

            // Login successful
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user)); // Assuming structure
            navigate('/admin/onboarding');

        } catch (err: any) {
            setError(err.response?.data?.message || 'Error joining organization');
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#A3FF00] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Invitation Error</h2>
                    <p className="text-white/50">{error}</p>
                    <button onClick={() => navigate('/admin')} className="text-[#A3FF00] hover:underline">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#A3FF00]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-8 relative z-10 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="w-12 h-12 mx-auto bg-[#A3FF00]/10 rounded-xl flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-[#A3FF00]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Join the Team</h1>
                    <p className="text-white/50 text-sm">
                        Accepting invitation for <span className="text-white">{inviteData.email}</span>
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                        <span className="text-xs text-white/70 uppercase font-semibold tracking-wider">Role:</span>
                        <span className="text-xs text-[#A3FF00] font-bold">{inviteData.role}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Name is already set by invite */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                        <label className="text-xs text-white/50 block">Name</label>
                        <p className="text-white font-medium">{inviteData.name || 'User'}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Create Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full h-11 pl-10 pr-4 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#A3FF00] transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full h-11 pl-10 pr-4 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#A3FF00] transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={verifying}
                        className="w-full h-12 mt-6 bg-[#A3FF00] text-black font-bold rounded-lg hover:bg-[#8FE000] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {verifying ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                Complete Setup
                                <Check className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default JoinPage;
