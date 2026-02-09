import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authFetch, api } from '../../services/api';
import { Check, ChevronRight, Globe, Calendar, Mail, HardDrive, Shield, User, Building, Phone, MapPin } from 'lucide-react';

const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshSession } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [googleStatus, setGoogleStatus] = useState<any>({ connected: false });
    const [isClient, setIsClient] = useState(false);

    // Data Collection State
    const [formData, setFormData] = useState({
        phone: '',
        jobTitle: '',
        // Client specific
        companyName: '',
        industry: '',
        billingAddress: '',
        // Worker specific
        address: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
    });

    useEffect(() => {
        // Load user from API to get latest Role
        api.get('/auth/me').then(res => {
            setUser(res.data);
            setIsClient(res.data.role === 'CLIENT');
        }).catch(err => {
            console.error("Auth check failed", err);
            navigate('/admin/login');
        });

        // Check for Google OAuth callback
        const params = new URLSearchParams(window.location.search);
        const googleCallback = params.get('google');
        const code = params.get('code');

        if (googleCallback === 'callback' && code) {
            handleGoogleCallback(code);
            window.history.replaceState({}, '', window.location.pathname);
        } else {
            fetchGoogleStatus();
        }
    }, [navigate]);

    const fetchGoogleStatus = async () => {
        try {
            const response = await authFetch('/api/google/auth/status');
            if (response.ok) {
                const data = await response.json();
                setGoogleStatus(data);
                // Optional: Auto-advance NOT recommended as user might want to see confirmation
            }
        } catch (error) {
            console.error('Failed to fetch Google status:', error);
        }
    };

    const handleGoogleCallback = async (code: string) => {
        setLoading(true);
        try {
            const response = await authFetch('/api/google/auth/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });
            if (response.ok) {
                await fetchGoogleStatus();
                setStep(2); // Stay on step 2 to show success checkmark
            }
        } catch (error) {
            console.error('Failed to complete Google auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectGoogle = async () => {
        setLoading(true);
        try {
            const response = await authFetch('/api/google/auth/url');
            if (response.ok) {
                const { url } = await response.json();
                window.location.href = url;
            }
        } catch (error) {
            console.error('Failed to get Google auth URL:', error);
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            // Construct payload depending on role
            const payload: any = {
                phone: formData.phone,
                jobTitle: formData.jobTitle,
                profileDetails: {}
            };

            if (isClient) {
                payload.profileDetails = {
                    companyName: formData.companyName,
                    industry: formData.industry,
                    billingAddress: formData.billingAddress
                };
            } else {
                payload.profileDetails = {
                    address: formData.address,
                    emergencyContact: {
                        name: formData.emergencyContactName,
                        phone: formData.emergencyContactPhone
                    }
                };
            }

            // Send Data & Complete Onboarding
            await authFetch('/api/users/onboarding/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Refresh session to update user.onboardingCompleted in AuthContext
            await refreshSession();
            navigate(isClient ? '/admin/projects' : '/admin');
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            // Fallback redirect
            navigate('/admin');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && isClient) {
            setStep(3); // Skip Google for Clients
        } else {
            setStep(step + 1);
        }
    };

    // Step Content Generators
    const renderWelcome = () => (
        <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-[#A3FF00]/10 rounded-2xl flex items-center justify-center">
                <Shield className="w-10 h-10 text-[#A3FF00]" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome, {user?.name?.split(' ')[0]}!</h2>
                <p className="text-white/50 max-w-md mx-auto">
                    {isClient
                        ? "We're excited to collaborate with you. This portal gives you real-time access to your project updates, assets, and invoices."
                        : "You've been invited to join the team. Let's get your secure environment set up."}
                </p>
            </div>
            <button
                onClick={nextStep}
                className="px-8 py-3 bg-[#A3FF00] text-black font-bold rounded-lg hover:bg-[#8FE000] transition-colors flex items-center gap-2 mx-auto"
            >
                Get Started <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );

    const renderGoogle = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center gap-2">
                    <Mail className="w-6 h-6 text-white/70" />
                    <span className="text-sm text-white/70">Gmail</span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center gap-2">
                    <Calendar className="w-6 h-6 text-white/70" />
                    <span className="text-sm text-white/70">Calendar</span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center gap-2">
                    <HardDrive className="w-6 h-6 text-white/70" />
                    <span className="text-sm text-white/70">Drive</span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center gap-2">
                    <Globe className="w-6 h-6 text-white/70" />
                    <span className="text-sm text-white/70">Contacts</span>
                </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <p className="text-sm text-blue-200 text-center">
                    We use your Google account to sync client communications and project files automatically.
                </p>
            </div>

            {googleStatus.connected ? (
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-semibold">Account Connected</span>
                    </div>
                    <button
                        onClick={nextStep}
                        className="w-full py-3 bg-[#A3FF00] text-black font-bold rounded-lg hover:bg-[#8FE000] transition-colors"
                    >
                        Continue
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleConnectGoogle}
                    disabled={loading}
                    className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <>
                            <span className="text-lg">🔵</span> Connect Google Account
                        </>
                    )}
                </button>
            )}
            {!googleStatus.connected && (
                <button onClick={nextStep} className="w-full text-white/30 text-xs hover:text-white transition-colors">
                    Skip for now (Limited Functionality)
                </button>
            )}
        </div>
    );

    const renderProfile = () => (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Full Name</label>
                    <input
                        type="text"
                        readOnly
                        value={user?.name || ''}
                        className="w-full h-11 px-4 bg-black/50 border border-white/10 rounded-lg text-white opacity-70 cursor-not-allowed"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Phone Number *</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                        <input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full h-11 pl-10 pr-4 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#A3FF00]"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Job Title / Role</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                        <input
                            type="text"
                            placeholder="e.g. Marketing Manager"
                            value={formData.jobTitle}
                            onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                            className="w-full h-11 pl-10 pr-4 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#A3FF00]"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={nextStep}
                disabled={!formData.phone} // Basic validation
                className="w-full py-3 bg-[#A3FF00] text-black font-bold rounded-lg hover:bg-[#8FE000] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );

    const renderDetails = () => (
        <div className="space-y-6">
            <p className="text-sm text-white/50 mb-4">
                {isClient ? "Please provide your business details for invoicing." : "Emergency contact information."}
            </p>

            {isClient ? (
                // Client Inputs
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Company Name</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                            <input
                                type="text"
                                placeholder="Acme Inc."
                                value={formData.companyName}
                                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                className="w-full h-11 pl-10 pr-4 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#A3FF00]"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Industry</label>
                        <input
                            type="text"
                            placeholder="e.g. Retail"
                            value={formData.industry}
                            onChange={e => setFormData({ ...formData, industry: e.target.value })}
                            className="w-full h-11 px-4 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#A3FF00]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Billing Address</label>
                        <textarea
                            rows={3}
                            placeholder="123 Main St..."
                            value={formData.billingAddress}
                            onChange={e => setFormData({ ...formData, billingAddress: e.target.value })}
                            className="w-full p-4 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#A3FF00]"
                        />
                    </div>
                </div>
            ) : (
                // Worker Inputs
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Emergency Contact Name</label>
                        <input
                            type="text"
                            value={formData.emergencyContactName}
                            onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                            className="w-full h-11 px-4 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#A3FF00]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Emergency Contact Phone</label>
                        <input
                            type="tel"
                            value={formData.emergencyContactPhone}
                            onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                            className="w-full h-11 px-4 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#A3FF00]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Home Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                            <textarea
                                rows={2}
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#A3FF00]"
                            />
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={handleComplete}
                disabled={loading}
                className="w-full py-3 bg-[#A3FF00] text-black font-bold rounded-lg hover:bg-[#8FE000] transition-colors flex items-center justify-center gap-2"
            >
                {loading ? 'Finalizing...' : 'Complete Setup'} <Check className="w-5 h-5" />
            </button>
        </div>
    );

    const steps = [
        { id: 1, title: 'Welcome', description: 'Let\'s get started.' },
        { id: 2, title: 'Connect', description: 'Integrate tools.' },
        { id: 3, title: 'Profile', description: 'Basic info.' },
        { id: 4, title: 'Details', description: 'Final touches.' },
    ];

    const currentStepTitle = steps.find(s => s.id === step)?.title;
    const currentStepDesc = steps.find(s => s.id === step)?.description;

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#A3FF00]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-lg z-10">
                {/* Progress Bar */}
                <div className="flex justify-between mb-8 px-2">
                    {steps.map((s) => {
                        if (s.id === 2 && isClient) return null; // Hide Google step for clients
                        return (
                            <div key={s.id} className="flex flex-col items-center gap-2 relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${s.id === step ? 'bg-[#A3FF00] text-black' :
                                    s.id < step ? 'bg-[#A3FF00]/20 text-[#A3FF00]' : 'bg-white/10 text-white/30'
                                    }`}>
                                    {s.id < step ? <Check className="w-4 h-4" /> : s.id}
                                </div>
                                <span className={`text-xs ${s.id === step ? 'text-white' : 'text-white/30'}`}>{s.title}</span>
                            </div>
                        )
                    })}
                    {/* Line behind */}
                    <div className="absolute top-4 left-0 w-full h-[1px] bg-white/10 -z-10" />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl"
                    >
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-white mb-2">{currentStepTitle}</h1>
                            <p className="text-white/50">{currentStepDesc}</p>
                        </div>

                        {step === 1 && renderWelcome()}
                        {step === 2 && renderGoogle()}
                        {step === 3 && renderProfile()}
                        {step === 4 && renderDetails()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OnboardingPage;
