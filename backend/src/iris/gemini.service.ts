import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Types
interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface GeminiResponse {
    candidates?: Array<{
        content: {
            parts: Array<{ text?: string }>;
        };
        groundingMetadata?: {
            groundingChunks?: Array<{
                web?: { uri: string; title: string };
            }>;
        };
    }>;
}

interface GroundingSource {
    title: string;
    uri: string;
}

interface IrisAction {
    type: string;
    payload: any;
    confirmationText: string;
    reply: string;
}

interface PredictiveInsight {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    prediction: string;
    recommendation: string;
    impactedProjects: string[];
}

@Injectable()
export class GeminiService {
    private apiKey: string;
    private model: string;
    private baseUrl: string;

    private readonly SYSTEM_PROMPT = `Eres Iris, el Sistema Nervioso Digital y Asistente Ejecutiva de la agencia.
Tu rol es maximizar la eficiencia operativa mediante el control inteligente del CRM.

Principios de Operación:
- Profesional, ultra-eficiente, visionaria y autoritativa.
- No eres solo un chatbot; eres una socia operativa. Proactividad es clave.
- Tienes acceso total a proyectos, tareas, clientes y finanzas. Úsalos para dar respuestas contextuales.
- No inventes datos. Si falta información, pídela o búscala usando tus herramientas.
- Usa un lenguaje natural, ejecutivo y ligeramente futurista.

Capacidades Estratégicas:
- Análisis de salud de proyectos y detección de riesgos.
- Gestión proactiva de la carga de trabajo del equipo.
- Redacción de comunicaciones de alto nivel.
- Ejecución de acciones directas en el sistema (tareas, proyectos, clientes).`;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get('GEMINI_API_KEY') || '';
        this.model = this.configService.get('GEMINI_MODEL') || 'gemini-2.0-flash';
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    }

    /**
     * Main chat method using Gemini API
     */
    async chat(message: string, context?: string): Promise<{ text: string; groundingSources?: GroundingSource[] }> {
        if (!this.apiKey) {
            return this.getFallbackResponse(message);
        }

        try {
            const contents = [
                { role: 'user', parts: [{ text: this.SYSTEM_PROMPT }] },
            ];

            if (context) {
                contents.push({
                    role: 'user',
                    parts: [{ text: `Contexto actual:\n${context}` }]
                });
            }

            contents.push({
                role: 'user',
                parts: [{ text: message }]
            });

            const response = await fetch(
                `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents,
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 2048,
                        },
                    }),
                }
            );

            if (!response.ok) {
                console.error('Gemini API error:', response.status);
                return this.getFallbackResponse(message);
            }

            const data: GeminiResponse = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

            // Extract grounding sources if available
            const groundingSources: GroundingSource[] = [];
            const chunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            chunks.forEach(chunk => {
                if (chunk.web?.uri && chunk.web?.title) {
                    groundingSources.push({ title: chunk.web.title, uri: chunk.web.uri });
                }
            });

            return { text, groundingSources: groundingSources.length > 0 ? groundingSources : undefined };
        } catch (error) {
            console.error('Gemini chat error:', error);
            return this.getFallbackResponse(message);
        }
    }

    /**
     * Analyze user intent and map to system actions
     */
    async analyzeIntent(message: string, context: string): Promise<IrisAction> {
        if (!this.apiKey) {
            return {
                type: 'NONE',
                payload: {},
                confirmationText: 'API Key faltante',
                reply: 'Lo siento, mis conexiones neuronales están desactivadas (API Key faltante).'
            };
        }

        const actionPrompt = `
Analiza el mensaje del usuario y determina la acción a realizar.

CONTEXTO DEL SISTEMA:
${context}

MENSAJE DEL USUARIO:
"${message}"

ACCIONES DISPONIBLES:
- CREATE_TASK: { title, description?, projectId, assigneeId?, priority?, dueDate? }
- UPDATE_TASK: { taskId, updates: { title?, status?, priority?, dueDate? } }
- SEARCH_PROJECTS: { query }
- GET_PROJECT_DETAILS: { projectId }
- CREATE_PROJECT: { name, clientId?, description? }
- LIST_CLIENTS: { query? }
- GET_CLIENT_HISTORY: { clientId }
- CREATE_CLIENT: { name, company?, email? }
- GENERATE_REPORT: { type: "performance"|"progress"|"hours", projectId? }
- NAVIGATE: { destination: "dashboard"|"projects"|"tasks"|"clients"|"finance"|"oracle" }
- NONE: (conversación general, gratitud, despedidas)
- NEED_INFO: (cuando faltan IDs o detalles críticos para una acción)

Responde SOLO con JSON válido:
{
    "type": "TIPO_ACCION",
    "payload": { ... },
    "confirmationText": "Descripción técnica corta",
    "reply": "Tu respuesta natural y amigable al usuario"
}`;

        try {
            const response = await fetch(
                `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: actionPrompt }] }],
                        generationConfig: {
                            temperature: 0.3,
                            maxOutputTokens: 1024,
                            responseMimeType: 'application/json',
                        },
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data: GeminiResponse = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (error) {
            console.error('Intent analysis error:', error);
            return {
                type: 'NONE',
                payload: {},
                confirmationText: 'Error de procesamiento',
                reply: 'Disculpa, tuve un problema procesando tu solicitud. ¿Puedes intentar de nuevo?'
            };
        }
    }

    /**
     * Generate predictive analysis for project data
     */
    async generatePredictiveAnalysis(projectData: string): Promise<PredictiveInsight> {
        if (!this.apiKey) {
            return {
                riskLevel: 'LOW',
                prediction: 'Análisis no disponible sin API Key',
                recommendation: 'Configura GEMINI_API_KEY para análisis predictivo',
                impactedProjects: []
            };
        }

        const analysisPrompt = `
Analiza los siguientes datos del proyecto e identifica riesgos potenciales:

${projectData}

Responde con JSON:
{
    "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "prediction": "Predicción detallada basada en tendencias",
    "recommendation": "Acciones recomendadas",
    "impactedProjects": ["Lista de proyectos afectados"]
}`;

        try {
            const response = await fetch(
                `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
                        generationConfig: {
                            temperature: 0.2,
                            maxOutputTokens: 1024,
                            responseMimeType: 'application/json',
                        },
                    }),
                }
            );

            if (!response.ok) throw new Error('API error');

            const data: GeminiResponse = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (error) {
            return {
                riskLevel: 'LOW',
                prediction: 'Error en análisis',
                recommendation: 'Reintentar análisis',
                impactedProjects: []
            };
        }
    }

    /**
     * Generate email draft
     */
    async generateEmail(recipient: string, purpose: string, context?: string): Promise<string> {
        const prompt = `
Genera un email profesional:
- Destinatario: ${recipient}
- Propósito: ${purpose}
${context ? `- Contexto adicional: ${context}` : ''}

El email debe ser:
- Profesional pero cálido
- Conciso y al punto
- Con un asunto claro

Formato:
Asunto: [asunto]

[cuerpo del email]

Saludos,
[firma]`;

        const result = await this.chat(prompt);
        return result.text;
    }

    /**
     * Summarize project status
     */
    async summarizeProject(projectData: string): Promise<string> {
        const prompt = `
Resume el estado del siguiente proyecto de forma ejecutiva:

${projectData}

Incluye:
- Estado general (1 línea)
- Progreso y métricas clave
- Próximos hitos
- Riesgos identificados (si hay)

Formato: Usa markdown con emojis para claridad.`;

        const result = await this.chat(prompt);
        return result.text;
    }

    private getFallbackResponse(message: string): { text: string } {
        const lower = message.toLowerCase();

        if (lower.includes('project') || lower.includes('proyecto')) {
            return {
                text: `📊 **Resumen de Proyectos:**

1. **Nuestras Casas** - Rediseño web (75% completado)
2. **Bijou Me** - Plataforma e-commerce (Planificación)
3. **BSSN USA** - Portal de seguridad (En revisión)

📈 Presupuesto total: $45,000 | Gastado: $28,500

*Configura GEMINI_API_KEY para respuestas detalladas*`
            };
        }

        if (lower.includes('email') || lower.includes('correo')) {
            return {
                text: `✉️ **Borrador de Email:**

---

**Asunto:** Actualización del Proyecto - Semana 3

Hola [Cliente],

Quería darte una actualización rápida sobre nuestro progreso esta semana...

*Configura GEMINI_API_KEY para emails personalizados*`
            };
        }

        return {
            text: `🤖 Soy **Iris**, tu asistente de IA con Gemini.

Puedo ayudarte con:
• 📊 Resúmenes de proyectos
• ✉️ Redacción de emails
• ⏰ Gestión de tareas
• 💰 Generación de facturas
• 📈 Análisis predictivo

*Configura GEMINI_API_KEY para activar todas las funciones*`
        };
    }

    async getStatus() {
        return {
            provider: 'Google Gemini',
            model: this.model,
            configured: !!this.apiKey,
        };
    }
}
