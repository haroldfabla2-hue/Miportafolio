import React, { useState, useRef, useEffect } from 'react';
import { authFetch } from '../../services/api';

// Types
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    imageUrl?: string;
    timestamp: Date;
}

interface Suggestion {
    id: string;
    text: string;
    icon: string;
}

// Iris AI Chat Page
const IrisPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const suggestions: Suggestion[] = [
        { id: '1', text: 'Resume mis proyectos activos', icon: '📊' },
        { id: '2', text: 'Redacta un email para mi cliente', icon: '✉️' },
        { id: '3', text: '¿Qué tareas están atrasadas?', icon: '⏰' },
        { id: '4', text: '/imagen logo minimalista para startup tech', icon: '🎨' },
    ];

    const [selectedModel, setSelectedModel] = useState('kimi-k2');

    const models = [
        { id: 'kimi-k2', name: 'Kimi K2.5', description: '🥇 Primary - Moonshot' },
        { id: 'glm-4.7-flash', name: 'GLM-4.7 Flash', description: '🥈 Backup - Zhipu' },
        { id: 'glm-4v-flash', name: 'GLM-4V Flash', description: 'Vision Capable' },
        { id: 'cogview-3-plus', name: 'CogView 3+', description: 'Image Generation' },
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0', description: '🥉 Tertiary - Google' }
    ];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await authFetch('/api/iris/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    model: selectedModel
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const aiResponse: Message = {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: data.response,
                    imageUrl: data.generatedImage,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiResponse]);
            } else {
                setMessages(prev => [...prev, {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: '⚠️ Error al conectar con Iris. Intenta de nuevo.',
                    timestamp: new Date()
                }]);
            }
        } catch {
            // Fallback to demo response
            const aiResponse: Message = {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                content: getFallbackResponse(input),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    const getFallbackResponse = (query: string): string => {
        const lower = query.toLowerCase();
        if (lower.includes('project') || lower.includes('proyecto')) {
            return "📊 **Resumen de Proyectos:**\n\n1. **Nuestras Casas** - 75% completado\n2. **Bijou Me** - En planificación\n\n*Conecta con el backend para datos reales*";
        }
        if (lower.startsWith('/imagen') || lower.startsWith('/image')) {
            return "🎨 Para generar imágenes, asegúrate de que el backend esté corriendo con la API key de ZhipuAI configurada.";
        }
        return "🤖 Soy Iris, tu asistente de IA.\n\nComandos:\n• `/imagen [descripción]` - Genera una imagen\n\n*Conecta el backend para todas las funciones*";
    };

    const useSuggestion = (text: string) => setInput(text);

    return (
        <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="admin-page-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-accent), #6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                    }}>🤖</div>
                    <div>
                        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Iris AI</h1>
                        <p className="admin-page-subtitle" style={{ marginTop: '0.25rem' }}>Asistente Inteligente • ZhipuAI Powered</p>
                    </div>
                </div>

                {/* Model Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--admin-card-bg)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--admin-border-color)' }}>
                    <span style={{ color: '#888', fontSize: '0.85rem' }}>Modelo:</span>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', outline: 'none' }}
                    >
                        {models.map(m => (
                            <option key={m.id} value={m.id} style={{ background: '#222' }}>{m.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Chat Container */}
            <div className="admin-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {messages.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
                                ¡Hola! Soy Iris
                            </h3>
                            <p style={{ marginBottom: '0.5rem' }}>Estoy usando el modelo <span style={{ color: 'var(--color-accent)' }}>{models.find(m => m.id === selectedModel)?.name}</span></p>
                            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '2rem' }}>
                                💡 Usa <code style={{ background: 'var(--admin-hover-bg)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>/imagen [descripción]</code> para generar imágenes con GLM-Image
                            </p>

                            {/* Suggestions */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                                {suggestions.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => useSuggestion(s.text)}
                                        style={{
                                            padding: '0.75rem 1rem', background: 'var(--admin-hover-bg)',
                                            border: '1px solid var(--admin-border-color)', borderRadius: '20px',
                                            color: '#ccc', cursor: 'pointer', fontSize: '0.85rem',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
                                        }}
                                    >
                                        <span>{s.icon}</span><span>{s.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div
                                key={msg.id}
                                style={{
                                    display: 'flex', gap: '0.75rem', marginBottom: '1.5rem',
                                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                                }}
                            >
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, fontSize: '1.1rem',
                                    background: msg.role === 'assistant' ? 'linear-gradient(135deg, var(--color-accent), #6366f1)' : 'var(--admin-hover-bg)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {msg.role === 'assistant' ? '🤖' : '👤'}
                                </div>
                                <div style={{
                                    maxWidth: '70%', padding: '1rem',
                                    background: msg.role === 'user' ? 'var(--color-accent)' : 'var(--admin-hover-bg)',
                                    color: msg.role === 'user' ? '#000' : '#fff',
                                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap'
                                }}>
                                    {msg.content}
                                    {msg.imageUrl && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <img src={msg.imageUrl} alt="Generated" style={{
                                                maxWidth: '100%', borderRadius: '12px',
                                                border: '1px solid var(--admin-border-color)'
                                            }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}

                    {isTyping && (
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--color-accent), #6366f1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
                            }}>🤖</div>
                            <div style={{ padding: '1rem', background: 'var(--admin-hover-bg)', borderRadius: '16px 16px 16px 4px', color: '#888' }}>
                                <span>Pensando...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '1rem', borderTop: '1px solid var(--admin-border-color)', display: 'flex', gap: '0.75rem' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={`Pregunta a Iris (${models.find(m => m.id === selectedModel)?.name})...`}
                        style={{
                            flex: 1, padding: '0.875rem 1rem', background: 'var(--admin-bg)',
                            border: '1px solid var(--admin-border-color)', borderRadius: '10px',
                            color: '#fff', fontSize: '0.95rem', outline: 'none'
                        }}
                    />
                    <button onClick={sendMessage} className="admin-btn admin-btn-primary" style={{ padding: '0.875rem 1.5rem' }}>
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IrisPage;
