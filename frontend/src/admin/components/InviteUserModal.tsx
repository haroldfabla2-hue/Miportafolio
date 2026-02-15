import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Shield, Send, Check } from 'lucide-react';
import { api } from '../../services/api';

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'ADMIN' | 'WORKER' | 'CLIENT'>('CLIENT');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sentLink, setSentLink] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSentLink(null);

        try {
            await api.post('/users/invite', { email, role });
            setSentLink('Email sent via Gmail'); // Just a flag to show success state
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error sending invitation');
            // If error is 401/403 related to Google, show hint
            if (err.response?.status === 401 && err.response?.data?.message?.includes('connect your Google')) {
                setError('You must connect your Google Account in Settings > Integrations to send invites.');
            }
        } finally {
            setLoading(false);
        }
    };



    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <h2 className="text-xl font-bold text-white">Invite User</h2>
                        <button onClick={onClose} className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        {!sentLink ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-3 text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full h-11 pl-10 pr-4 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#A3FF00] transition-colors"
                                            placeholder="colleague@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-white/70">Role</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['ADMIN', 'WORKER', 'CLIENT'] as const).map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setRole(r)}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${role === r
                                                    ? 'bg-[#A3FF00]/10 border-[#A3FF00] text-[#A3FF00]'
                                                    : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <Shield className={`w-5 h-5 mb-2 ${role === r ? 'text-[#A3FF00]' : 'text-white/30'}`} />
                                                <span className="text-xs font-semibold">{r}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 flex items-center justify-center gap-2 bg-[#A3FF00] text-black font-semibold rounded-lg hover:bg-[#8FE000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Invitation
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 mx-auto bg-[#A3FF00]/10 rounded-full flex items-center justify-center">
                                    <Check className="w-8 h-8 text-[#A3FF00]" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-white">Invitation Sent!</h3>
                                    <p className="text-white/50 text-sm">
                                        An email has been sent to <span className="text-white">{email}</span>.
                                    </p>
                                </div>

                                <div className="p-4 bg-black/20 rounded-xl space-y-2">
                                    <p className="text-sm text-white/70 text-center">
                                        The invitation has been sent securely via your connected Gmail account.
                                    </p>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="w-full h-11 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default InviteUserModal;
