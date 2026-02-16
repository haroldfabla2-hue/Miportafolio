import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: string;
}

interface NotificationBellProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onViewAll: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkAsRead, onViewAll }) => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'error': return <AlertCircle size={16} className="text-rose-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 bg-slate-900 border border-white/10 rounded-xl hover:bg-slate-800 transition-all group"
            >
                <Bell size={20} className={`text-slate-400 group-hover:text-brand-400 transition-colors ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-slate-900 shadow-sm shadow-brand-500/50"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60]"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden origin-top-right"
                        >
                            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Digital Feedback</h3>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] font-black text-brand-500 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                                        {unreadCount} NEW
                                    </span>
                                )}
                            </div>

                            <div className="max-h-80 overflow-y-auto custom-scroll">
                                {notifications.length === 0 ? (
                                    <div className="p-12 text-center text-slate-600">
                                        <Bell size={32} className="mx-auto mb-3 opacity-10" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Channels Silent</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {notifications.map(notif => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 flex gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer ${!notif.read ? 'bg-brand-500/[0.03]' : ''}`}
                                                onClick={() => {
                                                    onMarkAsRead(notif.id);
                                                    // Optional: navigate based on notif metadata
                                                }}
                                            >
                                                <div className="mt-0.5 flex-shrink-0">
                                                    {getIcon(notif.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <h4 className={`text-xs uppercase tracking-tight truncate ${!notif.read ? 'font-black text-white' : 'font-bold text-slate-400'}`}>
                                                            {notif.title}
                                                        </h4>
                                                        <span className="text-[9px] font-black text-slate-500 whitespace-nowrap ml-2">
                                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                </div>
                                                {!notif.read && (
                                                    <div className="flex flex-col justify-center">
                                                        <div className="w-1.5 h-1.5 bg-brand-500 rounded-full shadow-sm shadow-brand-500/50"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t border-white/5 bg-white/[0.02] text-center">
                                <button
                                    onClick={() => { setIsOpen(false); onViewAll(); }}
                                    className="text-[10px] font-black text-slate-500 hover:text-brand-500 transition-colors uppercase tracking-widest"
                                >
                                    Access Archive
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
