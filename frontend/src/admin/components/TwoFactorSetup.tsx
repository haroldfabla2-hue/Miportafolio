import React, { useState } from 'react';
import { Shield, X, Check, AlertTriangle, Key, Smartphone } from 'lucide-react';

interface TwoFactorSetupProps {
    isEnabled: boolean;
    onStatusChange: (enabled: boolean) => void;
    onClose: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
    isEnabled,
    onStatusChange,
    onClose
}) => {
    const [step, setStep] = useState<'initial' | 'qr' | 'verify' | 'disable'>('initial');
    const [qrCode, setQrCode] = useState<string>('');
    const [secret, setSecret] = useState<string>('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSetup = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/auth/2fa/setup', { method: 'POST' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setQrCode(data.qrCode);
            setSecret(data.secret);
            setStep('qr');
        } catch (err: any) {
            setError(err.message || 'Failed to setup 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (code.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            onStatusChange(true);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Invalid code. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!password && !code) {
            setError('Please enter your password or current 2FA code');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/auth/2fa/disable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, code }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            onStatusChange(false);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Shield size={20} className="text-indigo-600" />
                        Two-Factor Authentication
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Error Display */}
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Initial State */}
                    {step === 'initial' && (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                                <Smartphone size={32} className="text-slate-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">
                                    {isEnabled ? '2FA is Enabled' : 'Secure Your Account'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {isEnabled
                                        ? 'Your account is protected with two-factor authentication.'
                                        : 'Add an extra layer of security using an authenticator app.'}
                                </p>
                            </div>

                            {isEnabled ? (
                                <button
                                    onClick={() => setStep('disable')}
                                    className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition"
                                >
                                    Disable 2FA
                                </button>
                            ) : (
                                <button
                                    onClick={handleSetup}
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {loading ? 'Setting up...' : 'Enable 2FA'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* QR Code Step */}
                    {step === 'qr' && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-sm text-slate-600 mb-4">
                                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                                </p>
                                {qrCode && (
                                    <img
                                        src={qrCode}
                                        alt="2FA QR Code"
                                        className="mx-auto border border-slate-200 rounded-lg"
                                    />
                                )}
                            </div>

                            <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Can't scan? Enter manually:</p>
                                <code className="text-xs font-mono text-slate-700 break-all">{secret}</code>
                            </div>

                            <button
                                onClick={() => setStep('verify')}
                                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                            >
                                I've scanned the code
                            </button>
                        </div>
                    )}

                    {/* Verify Step */}
                    {step === 'verify' && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <Key size={32} className="mx-auto text-indigo-600 mb-2" />
                                <p className="text-sm text-slate-600">
                                    Enter the 6-digit code from your authenticator app
                                </p>
                            </div>

                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                className="w-full text-center text-3xl font-mono tracking-[0.5em] border border-slate-300 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500"
                                maxLength={6}
                                autoFocus
                            />

                            <button
                                onClick={handleVerify}
                                disabled={loading || code.length !== 6}
                                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Verifying...' : <><Check size={18} /> Verify & Enable</>}
                            </button>
                        </div>
                    )}

                    {/* Disable Step */}
                    {step === 'disable' && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <AlertTriangle size={32} className="mx-auto text-amber-500 mb-2" />
                                <p className="text-sm text-slate-600">
                                    Enter your password or current 2FA code to disable
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full border border-slate-300 rounded-lg p-3 text-sm"
                                />
                            </div>

                            <div className="text-center text-xs text-slate-400">— or —</div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">2FA Code</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full text-center font-mono tracking-widest border border-slate-300 rounded-lg p-3"
                                    maxLength={6}
                                />
                            </div>

                            <button
                                onClick={handleDisable}
                                disabled={loading || (!password && code.length !== 6)}
                                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Disabling...' : 'Disable 2FA'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TwoFactorSetup;
