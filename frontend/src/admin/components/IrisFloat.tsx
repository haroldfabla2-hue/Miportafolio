import React, { useState, useRef, useEffect } from 'react';
import { authFetch } from '../../services/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    imageUrl?: string;
}

interface IrisFloatProps {
    isOpen: boolean;
    onToggle: () => void;
}

const IrisFloat: React.FC<IrisFloatProps> = ({ isOpen, onToggle }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await authFetch('/api/iris/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: data.response,
                    imageUrl: data.generatedImage,
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: '⚠️ Error al conectar con Iris.',
                }]);
            }
        } catch {
            setMessages(prev => [...prev, {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                content: '🤖 Soy Iris. Conecta el backend para funciones completas.',
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                id="iris-float-btn"
                onClick={onToggle}
                data-tooltip="Ask Iris AI - Your Smart Assistant"
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-accent, #a3ff47), #6366f1)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(163, 255, 71, 0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    zIndex: 9999,
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(163, 255, 71, 0.4)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(163, 255, 71, 0.3)';
                }}
            >
                🤖
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '380px',
            height: '500px',
            background: '#0d0d0d',
            borderRadius: '16px',
            border: '1px solid #2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            zIndex: 9999,
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid #2a2a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#111',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-accent, #a3ff47), #6366f1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                    }}>🤖</div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>Iris AI</div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>ZhipuAI GLM-4V</div>
                    </div>
                </div>
                <button
                    onClick={onToggle}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        padding: '0.25rem',
                    }}
                >✕</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', position: 'relative' }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', padding: '2rem 1rem' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🤖</div>
                        <p style={{ fontSize: '0.85rem' }}>Hola! Soy Iris, tu asistente.</p>
                        <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.5rem' }}>
                            Usa <code style={{ background: '#222', padding: '2px 6px', borderRadius: '4px' }}>/imagen</code> para generar imágenes
                        </p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div
                            key={msg.id}
                            style={{
                                display: 'flex',
                                gap: '0.5rem',
                                marginBottom: '1rem',
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            }}
                        >
                            <div style={{
                                maxWidth: '75%',
                                padding: '0.75rem',
                                background: msg.role === 'user' ? 'var(--color-accent, #a3ff47)' : '#1a1a1a',
                                color: msg.role === 'user' ? '#000' : '#fff',
                                borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                fontSize: '0.85rem',
                                lineHeight: 1.5,
                                whiteSpace: 'pre-wrap',
                            }}>
                                {msg.content}
                                {msg.imageUrl && (
                                    <img
                                        src={msg.imageUrl}
                                        alt="Generated"
                                        style={{
                                            maxWidth: '100%',
                                            borderRadius: '8px',
                                            marginTop: '0.5rem',
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    ))
                )}
                {isTyping && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{
                            padding: '0.75rem',
                            background: '#1a1a1a',
                            borderRadius: '12px 12px 12px 2px',
                            color: '#888',
                            fontSize: '0.85rem',
                        }}>
                            Pensando...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '0.75rem',
                borderTop: '1px solid #2a2a2a',
                display: 'flex',
                gap: '0.5rem',
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Pregunta a Iris..."
                    style={{
                        flex: 1,
                        padding: '0.6rem 0.875rem',
                        background: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem',
                        outline: 'none',
                    }}
                />
                <button
                    onClick={sendMessage}
                    style={{
                        padding: '0.6rem 1rem',
                        background: 'var(--color-accent, #a3ff47)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#000',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                    }}
                >
                    →
                </button>
            </div>
        </div>
    );
};

export default IrisFloat;
