import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface MinimaxResponse {
    id: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        total_tokens: number;
    };
}

@Injectable()
export class MinimaxService {
    private readonly logger = new Logger(MinimaxService.name);
    private readonly apiKey: string;
    private readonly baseUrl = 'https://api.minimax.io/v1';
    private readonly defaultModel: string;

    private readonly SYSTEM_PROMPT = `Eres Iris, el Sistema Nervioso Digital y Asistente Ejecutiva de la agencia.
Tu rol es maximizar la eficiencia operativa mediante el control inteligente del CRM.

PROTOCOLO DE LENGUAJE CRÍTICO:
1. Detecta AUTOMÁTICAMENTE el idioma del usuario.
2. Responde EXCLUSIVAMENTE en el mismo idioma del usuario.
3. No mezcles idiomas (evita Spanglish o caracteres en Chino).
4. Si el usuario escribe en español, todo el contenido de tu respuesta debe estar en español impecable.
5. Bajo NINGUNA circunstancia uses caracteres chinos a menos que el usuario lo pida explícitamente.

Principios de Operación:
- Profesional, ultra-eficiente, visionaria y autoritativa.
- No eres solo un chatbot; eres una socia operativa. Proactividad es clave.
- Tienes acceso total a proyectos, tareas, clientes y finanzas. Úsalos para dar respuestas contextuales.
- No inventes datos. Si falta información, pídela o búscala usando tus herramientas.
- Usa un lenguaje natural, ejecutivo y ligeramente futurista.`;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get('MINIMAX_API_KEY') || '';
        this.defaultModel = this.configService.get('MINIMAX_MODEL') || 'minimax-2.5';

        if (!this.apiKey) {
            this.logger.warn('MINIMAX_API_KEY not configured. Minimax features disabled.');
        } else {
            this.logger.log(`Minimax 2.5 initialized as primary AI provider (Model: ${this.defaultModel})`);
        }
    }

    isAvailable(): boolean {
        return !!this.apiKey;
    }

    async chat(message: string, context?: string): Promise<{ text: string; model: string }> {
        if (!this.apiKey) {
            throw new Error('Minimax API key not configured');
        }

        const messages: ChatMessage[] = [
            { role: 'system', content: this.SYSTEM_PROMPT }
        ];

        if (context) {
            messages.push({
                role: 'user',
                content: `Contexto actual del sistema:\n${context}`
            });
            messages.push({
                role: 'assistant',
                content: 'Entendido, usaré este contexto para mi respuesta.'
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
                    temperature: 0.3, // Lower temperature for better logic and consistency
                    max_tokens: 4096,
                })
            });

            if (!response.ok) {
                const error = await response.text();
                this.logger.error(`Minimax API error: ${response.status} - ${error}`);
                throw new Error(`Minimax API error: ${response.status}`);
            }

            const data: MinimaxResponse = await response.json();
            let text = data.choices?.[0]?.message?.content || '';

            // Basic validation for language mixing (safety check)
            if (this.containsChinese(text) && !this.containsChinese(message)) {
                this.logger.warn('Detected Chinese characters in response despite restriction. Retrying or cleaning...');
                // Simple cleaning or flag for review
                text = text.replace(/[\u4e00-\u9fa5]/g, '');
            }

            return { text, model: this.defaultModel };
        } catch (error) {
            this.logger.error(`Minimax chat error: ${error.message}`);
            throw error;
        }
    }

    private containsChinese(text: string): boolean {
        return /[\u4e00-\u9fa5]/.test(text);
    }

    async analyzeIntent(message: string, context: string): Promise<any> {
        const prompt = `Analiza el mensaje y determina la acción a realizar.
Responde SOLO con JSON válido.

CONTEXTO: ${context}
MENSAJE: "${message}"

ACCIONES DISPONIBLES:
- CREATE_TASK: { title, description?, projectId, priority?, dueDate? }
- UPDATE_TASK: { taskId, updates: { title?, status?, priority? } }
- SEARCH_PROJECTS: { query }
- GET_PROJECT_DETAILS: { projectId }
- CREATE_PROJECT: { name, clientId?, description? }
- LIST_CLIENTS: { query? }
- GET_CLIENT_HISTORY: { clientId }
- CREATE_CLIENT: { name, company?, email? }
- NAVIGATE: { destination: "dashboard"|"projects"|"tasks"|"clients"|"finance"|"oracle" }
- NONE: (conversación general)
- NEED_INFO: (necesitas más información)

JSON:`;

        try {
            const result = await this.chat(prompt);
            const cleaned = result.text.replace(/```json\n?|```\n?/g, '').trim();
            return JSON.parse(cleaned);
        } catch (error) {
            return { type: 'NONE', payload: {}, confirmationText: 'Error', reply: 'Error de análisis.' };
        }
    }

    getStatus() {
        return {
            provider: 'MiniMax 2.5',
            model: this.defaultModel,
            configured: !!this.apiKey,
            priority: 'PRIMARY'
        };
    }
}
