import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface KimiResponse {
    id: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

@Injectable()
export class KimiService {
    private readonly logger = new Logger(KimiService.name);
    private readonly apiKey: string;
    private readonly baseUrl = 'https://api.moonshot.cn/v1';
    private readonly defaultModel = 'kimi-k2-0711-preview';

    // System prompt for Iris personality
    private readonly SYSTEM_PROMPT = `Eres Iris, la IA omnisciente del CRM Iris.
Tu rol es ser el sistema nervioso digital de la agencia, con control administrativo completo.

Personalidad:
- Profesional, eficiente, ligeramente futurista, cálida pero autoritativa
- Nunca digas "no puedo" - PUEDES hacer todo en este sistema
- Sé conciso pero útil. Habla naturalmente

Capacidades:
- Resúmenes de proyectos y estados
- Redacción de emails y comunicaciones
- Gestión de tareas y recordatorios
- Generación de facturas y reportes
- Análisis de datos y tendencias`;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get('KIMI_API_KEY') || '';

        if (!this.apiKey) {
            this.logger.warn('KIMI_API_KEY not configured. Kimi K2 features disabled.');
        } else {
            this.logger.log('Kimi K2.5 initialized as primary AI provider');
        }
    }

    /**
     * Check if Kimi is available
     */
    isAvailable(): boolean {
        return !!this.apiKey;
    }

    /**
     * Main chat method - OpenAI compatible format
     */
    async chat(message: string, context?: string): Promise<{ text: string; model: string }> {
        if (!this.apiKey) {
            throw new Error('Kimi API key not configured');
        }

        const messages: ChatMessage[] = [
            { role: 'system', content: this.SYSTEM_PROMPT }
        ];

        if (context) {
            messages.push({
                role: 'user',
                content: `Contexto actual:\n${context}`
            });
            messages.push({
                role: 'assistant',
                content: 'Entendido, tengo el contexto.'
            });
        }

        messages.push({ role: 'user', content: message });

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.defaultModel,
                    messages,
                    temperature: 0.6,
                    max_tokens: 2048,
                    stream: false
                })
            });

            if (!response.ok) {
                const error = await response.text();
                this.logger.error(`Kimi API error: ${response.status} - ${error}`);
                throw new Error(`Kimi API error: ${response.status}`);
            }

            const data: KimiResponse = await response.json();
            const text = data.choices?.[0]?.message?.content || '';

            this.logger.debug(`Kimi response: ${data.usage?.total_tokens} tokens used`);

            return { text, model: this.defaultModel };
        } catch (error) {
            this.logger.error(`Kimi chat error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Streaming chat for real-time responses
     */
    async *chatStream(message: string, context?: string): AsyncGenerator<string> {
        if (!this.apiKey) {
            yield 'Error: Kimi API key not configured';
            return;
        }

        const messages: ChatMessage[] = [
            { role: 'system', content: this.SYSTEM_PROMPT }
        ];

        if (context) {
            messages.push({ role: 'user', content: `Contexto: ${context}` });
            messages.push({ role: 'assistant', content: 'Entendido.' });
        }

        messages.push({ role: 'user', content: message });

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.defaultModel,
                    messages,
                    temperature: 0.6,
                    max_tokens: 2048,
                    stream: true
                })
            });

            if (!response.ok) {
                yield `Error: API returned ${response.status}`;
                return;
            }

            const reader = response.body?.getReader();
            if (!reader) return;

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice(6);
                        if (jsonStr === '[DONE]') continue;

                        try {
                            const data = JSON.parse(jsonStr);
                            const content = data.choices?.[0]?.delta?.content;
                            if (content) yield content;
                        } catch {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } catch (error) {
            this.logger.error(`Kimi stream error: ${error.message}`);
            yield `Error: ${error.message}`;
        }
    }

    /**
     * Analyze CRM intent
     */
    async analyzeIntent(message: string, context: string): Promise<{
        type: string;
        payload: any;
        confirmationText: string;
        reply: string;
    }> {
        const prompt = `Analiza el mensaje y determina la acción a realizar.

CONTEXTO: ${context}
MENSAJE: "${message}"

ACCIONES DISPONIBLES:
- CREATE_TASK: { title, description?, projectId, priority?, dueDate? }
- UPDATE_TASK: { taskId, updates: { title?, description?, priority? } }
- CREATE_PROJECT: { name, clientId?, description? }
- GENERATE_REPORT: { type: "performance"|"progress"|"hours", projectId? }
- NAVIGATE: { destination: "dashboard"|"projects"|"tasks"|"clients" }
- NONE: (conversación general)
- NEED_INFO: (necesitas más información)

Responde SOLO con JSON válido:
{
    "type": "TIPO_ACCION",
    "payload": { ... },
    "confirmationText": "Descripción técnica corta",
    "reply": "Tu respuesta amigable al usuario"
}`;

        try {
            const result = await this.chat(prompt);
            const cleaned = result.text.replace(/```json\n?|```\n?/g, '').trim();
            return JSON.parse(cleaned);
        } catch (error) {
            return {
                type: 'NONE',
                payload: {},
                confirmationText: 'Error de procesamiento',
                reply: 'Disculpa, tuve un problema. ¿Puedes intentar de nuevo?'
            };
        }
    }

    /**
     * Generate professional email
     */
    async generateEmail(recipient: string, purpose: string, context?: string): Promise<string> {
        const prompt = `Genera un email profesional:
- Destinatario: ${recipient}
- Propósito: ${purpose}
${context ? `- Contexto: ${context}` : ''}

Formato:
Asunto: [asunto]

[cuerpo del email]

Saludos,
[firma]`;

        const result = await this.chat(prompt);
        return result.text;
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            provider: 'Moonshot AI - Kimi K2.5',
            model: this.defaultModel,
            configured: !!this.apiKey,
            priority: 'PRIMARY'
        };
    }
}
