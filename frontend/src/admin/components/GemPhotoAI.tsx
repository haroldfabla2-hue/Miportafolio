import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Sparkles, RefreshCw, Check, AlertCircle } from 'lucide-react';
import geminiService from '../../services/geminiService';

interface GemPhotoAIProps {
    imageUrl: string;
    onClose: () => void;
    onApply: (newUrl: string) => void;
}

const GemPhotoAI: React.FC<GemPhotoAIProps> = ({ imageUrl, onClose, onApply }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGemify = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            const result = await geminiService.generateGemifiedImage(imageUrl);
            if (result) {
                setResultImage(result);
            } else {
                setError('Failed to process image. Please try again.');
            }
        } catch (err) {
            setError('An error occurred during transformation.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* PREVIEW AREA */}
                        <div className="relative aspect-square bg-[#111] flex items-center justify-center overflow-hidden">
                            {!resultImage ? (
                                <img src={imageUrl} alt="Original" className="w-full h-full object-cover opacity-50" />
                            ) : (
                                <img src={resultImage} alt="Gemified" className="w-full h-full object-cover" />
                            )}

                            {isProcessing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <RefreshCw size={48} className="text-brand-500" />
                                    </motion.div>
                                    <p className="mt-4 text-white font-black tracking-widest text-xs">TRANSMUTING ASSET...</p>
                                </div>
                            )}

                            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                                <Sparkles size={12} className="text-brand-400" />
                                <span className="text-[10px] font-black text-white uppercase tracking-tighter">Gemini Vision 2.0</span>
                            </div>
                        </div>

                        {/* CONTROLS AREA */}
                        <div className="p-8 flex flex-col justify-between bg-gradient-to-br from-[#0c0c0c] to-[#050505]">
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-3xl font-black text-white leading-tight">GemPhoto AI</h2>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Advanced Aesthetic Neural Engine</p>
                                    </div>
                                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
                                        <X size={20} />
                                    </button>
                                </div>

                                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                    Transform your standard assets into premium Brandistry-grade visuals. Our engine applies crystal diffraction, volumetric lighting, and deep-glow polish tailored for high-end digital experiences.
                                </p>

                                {error && (
                                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-bold">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {!resultImage ? (
                                    <button
                                        onClick={handleGemify}
                                        disabled={isProcessing}
                                        className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl font-black text-sm tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        <Wand2 size={20} /> START TRANSMUTATION
                                    </button>
                                ) : (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleGemify}
                                            className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-sm tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                                        >
                                            <RefreshCw size={20} /> RESET
                                        </button>
                                        <button
                                            onClick={() => onApply(resultImage)}
                                            className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-black text-sm tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3"
                                        >
                                            <Check size={20} /> APPLY ASSET
                                        </button>
                                    </div>
                                )}

                                <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-tighter transition-opacity duration-300">
                                    {isProcessing ? 'Neural processing in progress...' : 'Ready for asset generation'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GemPhotoAI;
