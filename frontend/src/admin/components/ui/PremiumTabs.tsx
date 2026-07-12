import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface PremiumTabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

export const PremiumTabs: React.FC<PremiumTabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
    return (
        <div className={`flex gap-2 p-1.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 w-fit overflow-x-auto custom-scroll ${className}`}>
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-2 z-10 whitespace-nowrap ${
                            isActive ? 'text-black' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTabPill"
                                className="absolute inset-0 rounded-lg -z-10"
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                style={{ backgroundColor: 'var(--color-accent, #A3FF00)' }}
                            />
                        )}
                        {tab.icon && <span className="z-10 flex items-center justify-center">{tab.icon}</span>}
                        <span className="z-10 relative">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
};
