import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bold, Italic, Link, List, Quote, Code, Heading1, Heading2, Image as ImageIcon } from 'lucide-react';

interface PremiumBlockEditorProps {
    value: string;
    onChange: (val: string) => void;
}

export const PremiumBlockEditor: React.FC<PremiumBlockEditorProps> = ({ value, onChange }) => {
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertText = (before: string, after: string = '') => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = textareaRef.current.value;
        const selected = text.substring(start, end);
        const newText = text.substring(0, start) + before + selected + after + text.substring(end);
        onChange(newText);
        
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(start + before.length, end + before.length);
            }
        }, 0);
    };

    const tools = [
        { icon: <Heading1 size={14} />, label: 'H1', action: () => insertText('# ', '') },
        { icon: <Heading2 size={14} />, label: 'H2', action: () => insertText('## ', '') },
        { icon: <Bold size={14} />, label: 'Bold', action: () => insertText('**', '**') },
        { icon: <Italic size={14} />, label: 'Italic', action: () => insertText('*', '*') },
        { icon: <List size={14} />, label: 'List', action: () => insertText('- ', '') },
        { icon: <Quote size={14} />, label: 'Quote', action: () => insertText('> ', '') },
        { icon: <Code size={14} />, label: 'Code', action: () => insertText('```\n', '\n```') },
        { icon: <Link size={14} />, label: 'Link', action: () => insertText('[', '](url)') },
        { icon: <ImageIcon size={14} />, label: 'Image', action: () => insertText('![alt](', ')') },
    ];

    return (
        <motion.div 
            animate={{ 
                borderColor: isFocused ? 'var(--color-accent, #a3ff00)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isFocused ? '0 0 0 1px var(--color-accent, #a3ff00)' : 'none'
            }}
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            className="rounded-xl bg-slate-900/50 backdrop-blur-md overflow-hidden transition-colors"
        >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-slate-800/50">
                {tools.map((t, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={t.action}
                        title={t.label}
                        className="p-2 text-slate-400 hover:text-accent hover:bg-slate-700/50 rounded-lg transition-colors flex items-center justify-center"
                    >
                        {t.icon}
                    </button>
                ))}
                <div className="flex-1" />
                <span className="text-[10px] text-slate-500 font-medium px-2 uppercase tracking-wider">Markdown Editor</span>
            </div>

            {/* Editor Area */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Start writing..."
                className="w-full min-h-[300px] p-4 bg-transparent text-slate-200 outline-none resize-y font-mono text-sm leading-relaxed custom-scroll"
            />
        </motion.div>
    );
};
