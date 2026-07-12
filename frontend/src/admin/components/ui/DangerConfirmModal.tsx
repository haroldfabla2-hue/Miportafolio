import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface DangerConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    requireType?: string; // e.g., 'ELIMINAR'
}

export const DangerConfirmModal: React.FC<DangerConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel, requireType }) => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState('');

    const isMatch = requireType ? inputValue === requireType : true;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                    <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">{message}</p>

                    {requireType && (
                        <div className="mb-6">
                            <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wide">
                                {t('danger.modal.typeConfirm', 'Type')} <strong className="text-white bg-slate-800 px-1 py-0.5 rounded">{requireType}</strong> {t('danger.modal.toConfirm', 'to confirm:')}
                            </label>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 transition-colors font-mono"
                                placeholder={requireType}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-2">
                        <button
                            onClick={() => {
                                setInputValue('');
                                onCancel();
                            }}
                            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            {t('common.cancel', 'Cancel')}
                        </button>
                        <button
                            onClick={() => {
                                if (isMatch) {
                                    setInputValue('');
                                    onConfirm();
                                }
                            }}
                            disabled={!isMatch}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                isMatch 
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            {t('common.confirm', 'Confirm')}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
