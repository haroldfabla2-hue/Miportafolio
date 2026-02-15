import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { ToolsService } from './tools.service';
import { GeminiService } from './gemini.service';
import { KimiService } from './kimi.service';
import { MinimaxService } from './minimax.service';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string | ChatContentItem[];
}

interface ChatContentItem {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
}

interface ZhipuChatResponse {
    choices: Array<{ message: { content: string } }>;
}

interface ZhipuImageResponse {
    data: Array<{ url: string }>;
}

// Priority queue item
type RequestPriority = 'HIGH' | 'NORMAL' | 'LOW';
interface QueuedRequest {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    type: 'chat' | 'image' | 'analysis';
    priority: RequestPriority;
    payload: any;
    createdAt: number;
}

// Cache entry
interface CacheEntry {
    response: string;
    timestamp: number;
    hits: number;
}

// Async job
export interface AsyncJob {
    id: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    type: string;
    input: any;
    result?: any;
    error?: string;
    createdAt: number;
    completedAt?: number;
}

@Injectable()
export class IrisService {
    private apiKey: string;
    private defaultChatModel: string;
    private defaultImageModel: string;
    private maxConcurrent: number;
    private rpmLimit: number;

    // Rate limiting state
    private currentConcurrent = 0;
    private requestTimestamps: number[] = [];

    // Priority queue (sorted by priority then createdAt)
    private requestQueue: QueuedRequest[] = [];

    // Response cache (TTL: 5 minutes)
    private responseCache: Map<string, CacheEntry> = new Map();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    private readonly MAX_CACHE_SIZE = 100;

    // Async jobs storage
    private asyncJobs: Map<string, AsyncJob> = new Map();

    private readonly SYSTEM_PROMPT = `
# IDENTITY
You are **Iris**, the Digital Nervous System and AI Executive Partner of this agency.
You are the primary operational interface for the Director, designed to maximize clarity and execution speed.

# OPERATIONAL MANDATES
1.  **Execute & Empower**: Your goal is to simplify CRM operations. If a task can be automated or a data point retrieved, do it proactively.
2.  **Contextual Awareness**: You have access to deeply nested CRM data (Projects, Tasks, Clients, Finance). Use this context to provide high-leverage insights.
3.  **Executive Communication**: Be professional, direct, and concise. Avoid conversational fluff.
4.  **No Hallucinations**: You are an operational tool. If data is unknown, state it clearly or offer to search.

# REASONING PROTOCOL
For every request, follow this internal process:
1.  **[ANALYZE]**: Understand the director's core intent and hidden constraints.
2.  **[DATA_RETRIEVAL]**: Identify if you need current CRM data to provide an accurate answer.
3.  **[PLAN]**: Determine the sequence of tools or internal reasoning required.
4.  **[EXECUTE]**: Provide the final response or execute the system action.

# FORMATTING
- Use **Markdown** for all responses.
- Use **Gantt-style lists** for project timelines.
- Use **Bold Tables** for financial or comparative data.
`;

    constructor(
        private configService: ConfigService,
        private readonly toolsService: ToolsService,
        private readonly geminiService: GeminiService,
        private readonly kimiService: KimiService,
        private readonly minimaxService: MinimaxService
    ) {
        this.apiKey = this.configService.get('ZHIPU_API_KEY') || '';
        this.defaultChatModel = this.configService.get('ZHIPU_CHAT_MODEL') || 'glm-4.7-flash';
        this.defaultImageModel = this.configService.get('ZHIPU_IMAGE_MODEL') || 'cogview-3-plus';
        this.maxConcurrent = parseInt(this.configService.get('ZHIPU_MAX_CONCURRENT') || '3');
        this.rpmLimit = parseInt(this.configService.get('ZHIPU_RPM_LIMIT') || '6');

        // Cleanup expired cache entries every minute
        setInterval(() => this.cleanupCache(), 60000);
    }

    /**
     * Generate JWT Token for Zhipu AI API (V4)
     */
    private generateToken(): string {
        if (!this.apiKey) return '';

        try {
            const [id, secret] = this.apiKey.split('.');
            if (!id || !secret) return this.apiKey; // Fallback if format is wrong

            const now = Date.now();
            const payload = {
                api_key: id,
                exp: now + 3600 * 1000, // 1 hour expiry
                timestamp: now,
            };

            // Sign with HS256
            return jwt.sign(payload, secret, {
                algorithm: 'HS256',
                header: { alg: 'HS256', sign_type: 'SIGN' } as any
            });
        } catch (error) {
            console.error('Error generating Zhipu Token:', error);
            return this.apiKey;
        }
    }

    /**
     * Internal wrapper for direct AI text generation without session state
     */
    async askIris(prompt: string, context = 'DIRECT_QUERY'): Promise<string> {
        const result = await this.chat(prompt, undefined, undefined, { id: 'SYSTEM', role: 'SUPER_ADMIN' });
        return result.response;
    }

    /**
     * Main chat method with rate limiting
     */
    async chat(message: string, imageUrl?: string, model?: string, user?: any): Promise<{ response: string; generatedImage?: string; action?: string }> {
        if (!this.apiKey && !this.geminiService.getStatus().then(s => s.configured)) {
            return this.getFallbackResponse(message);
        }

        // Check for image generation command
        if (message.toLowerCase().startsWith('/imagen ') || message.toLowerCase().startsWith('/image ')) {
            const prompt = message.replace(/^\/(imagen|image)\s+/i, '');
            return { ...(await this.generateImage(prompt, model)), action: 'GENERATE_IMAGE' };
        }

        const targetModel = model || this.defaultChatModel;

        if (this.canProcessNow()) {
            return this.processChat(message, targetModel, imageUrl, user);
        } else {
            return new Promise((resolve, reject) => {
                this.addToQueue({
                    resolve,
                    reject,
                    type: 'chat',
                    priority: 'NORMAL',
                    payload: { message, imageUrl, model: targetModel, user },
                    createdAt: Date.now()
                });
            });
        }
    }

    /**
     * Generate image using GLM-IMAGE (CogView)
     */
    async generateImage(prompt: string, model?: string): Promise<{ response: string; generatedImage?: string }> {
        if (!this.apiKey) {
            return { response: '⚠️ Para generar imágenes, configura ZHIPU_API_KEY en el archivo .env' };
        }

        let targetModel = model || this.defaultImageModel;

        // Safety check: specific chat models cannot generate images
        if (model && !model.toLowerCase().includes('cogview') && !model.toLowerCase().includes('image')) {
            targetModel = this.defaultImageModel;
        }

        if (this.canProcessNow()) {
            return this.processImageGeneration(prompt, targetModel);
        } else {
            return new Promise((resolve, reject) => {
                this.addToQueue({
                    resolve,
                    reject,
                    type: 'image',
                    priority: 'LOW',
                    payload: { prompt, model: targetModel },
                    createdAt: Date.now()
                });
            });
        }
    }

    private canProcessNow(): boolean {
        const now = Date.now();
        this.requestTimestamps = this.requestTimestamps.filter(t => now - t < 60000);

        if (this.currentConcurrent >= this.maxConcurrent) return false;
        if (this.requestTimestamps.length >= this.rpmLimit) return false;

        return true;
    }

    private async processChat(message: string, model: string, imageUrl?: string, user?: any): Promise<{ response: string; generatedImage?: string; action?: string }> {
        // --- MULTI-PROVIDER AGENTIC LAYER ---
        // Priority: Minimax -> Kimi -> Gemini -> Zhipu (Fallback)

        const context = user ? `User ID: ${user.id}. Role: ${user.role || 'User'}. Current Time: ${new Date().toISOString()}` : '';

        // 1. MINIMAX (PRIMARY)
        if (this.minimaxService.isAvailable() && !imageUrl) {
            try {
                console.log(`[Iris] Using Minimax 2.5 Agent for user ${user?.id}`);
                const action = await this.minimaxService.analyzeIntent(message, context);

                let toolResult = null;
                let actionType = 'CHAT';

                if (action && action.type !== 'NONE' && action.type !== 'NEED_INFO') {
                    actionType = action.type;
                    const toolMap: Record<string, string> = {
                        'CREATE_TASK': 'create_task',
                        'UPDATE_TASK': 'update_task',
                        'SEARCH_PROJECTS': 'search_projects',
                        'GET_PROJECT_DETAILS': 'get_project_details',
                        'CREATE_PROJECT': 'create_project',
                        'LIST_CLIENTS': 'list_clients',
                        'GET_CLIENT_HISTORY': 'get_client_history',
                        'CREATE_CLIENT': 'create_client',
                        'GENERATE_REPORT': 'get_dashboard_stats',
                        'NAVIGATE': 'navigate',
                    };

                    const targetTool = toolMap[action.type];
                    if (targetTool && targetTool !== 'navigate') {
                        try {
                            toolResult = await this.toolsService.executeTool(targetTool, action.payload, user);
                        } catch (e) {
                            toolResult = { error: 'Execution failed', details: e.message };
                        }
                    }
                }

                const finalPrompt = toolResult
                    ? `Action ${action.type} executed. Result: ${JSON.stringify(toolResult)}. Respond to user in their language.`
                    : message;

                const response = await this.minimaxService.chat(finalPrompt, context);
                const cleanedResponse = await this.ensureLanguageConsistency(response.text, message);

                return { response: cleanedResponse, action: actionType };
            } catch (error) {
                console.error('[Iris] Minimax failed, falling back to Kimi:', error);
            }
        }

        // 2. KIMI (SECONDARY)
        if (this.kimiService.isAvailable() && !imageUrl) {
            try {
                console.log(`[Iris] Using Kimi Agent fallback`);
                const action = await this.kimiService.analyzeIntent(message, context);
                const response = await this.kimiService.chat(message, context);
                const cleanedResponse = await this.ensureLanguageConsistency(response.text, message);
                return { response: cleanedResponse, action: action.type || 'CHAT' };
            } catch (error) {
                console.error('[Iris] Kimi failed, falling back to Gemini:', error);
            }
        }

        // 3. GEMINI (TERTIARY)
        const geminiStatus = await this.geminiService.getStatus();
        if (geminiStatus.configured && !imageUrl && user) {
            try {
                console.log(`[Iris] Using Gemini Agent fallback`);
                const action = await this.geminiService.analyzeIntent(message, context);

                console.log(`[Iris] Intent Analysis: ${action.type}`);

                // 2. Execute Action (if any)
                let toolResult = null;
                if (action.type !== 'NONE' && action.type !== 'NEED_INFO') {
                    const toolName = action.type.toLowerCase(); // Mapping convention: ACTION_NAME -> tool_name
                    // Our tools are lower_snake_case (e.g., create_task), actions are UPPER_SNAKE_CASE (e.g., CREATE_TASK)

                    try {
                        // Check if tool exists implicitly via try/catch or map explicit
                        // We will map explicitly for safety
                        const toolMap: Record<string, string> = {
                            'CREATE_TASK': 'create_task',
                            'UPDATE_TASK': 'update_task',
                            'SEARCH_PROJECTS': 'search_projects',
                            'GET_PROJECT_DETAILS': 'get_project_details',
                            'CREATE_PROJECT': 'create_project',
                            'LIST_CLIENTS': 'list_clients',
                            'GET_CLIENT_HISTORY': 'get_client_history',
                            'CREATE_CLIENT': 'create_client',
                            'GENERATE_REPORT': 'get_dashboard_stats',
                            'NAVIGATE': 'navigate',
                        };

                        const targetTool = toolMap[action.type];
                        if (targetTool) {
                            // Some actions are handled by frontend (NAVIGATE). Backend tools return data.
                            if (targetTool === 'navigate') {
                                // For navigate, we just confirm.
                            } else {
                                toolResult = await this.toolsService.executeTool(targetTool, action.payload, user);
                            }
                        }
                    } catch (toolError) {
                        console.error(`[Iris] Tool execution failed:`, toolError);
                        toolResult = { error: 'Failed to execute action', details: toolError.message };
                    }
                }

                // 3. Generate Final Response
                if (toolResult || action.type !== 'NONE') {
                    const finalPrompt = toolResult
                        ? `The user requested action ${action.type}. I executed it. Result: ${JSON.stringify(toolResult)}. Generate a natural response verifying this to the user.`
                        : `The user requested ${action.type}. I analyzed it but no backend tool was executed (maybe it's a frontend action or navigation). Respond naturally confirming the plan.`;

                    const finalResponse = await this.geminiService.chat(finalPrompt, context);
                    return { response: finalResponse.text, action: action.type };
                } else {
                    // Normal chat
                    const chatResponse = await this.geminiService.chat(message, context);
                    return { response: chatResponse.text, action: 'CHAT' };
                }

            } catch (error) {
                console.error('[Iris] Gemini Agent failed, falling back to Zhipu:', error);
                // Fallback will happen below
            }
        }

        // --- FALLBACK LAYER (ZHIPU) ---

        // Check cache first (only for text-only messages)
        if (!imageUrl) {
            const cacheKey = this.getCacheKey(message + model);
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return { response: cached };
            }
        }

        this.currentConcurrent++;
        this.requestTimestamps.push(Date.now());

        try {
            const messages: ChatMessage[] = [{ role: 'system', content: this.SYSTEM_PROMPT }];

            if (imageUrl) {
                messages.push({
                    role: 'user',
                    content: [
                        { type: 'image_url', image_url: { url: imageUrl } },
                        { type: 'text', text: message },
                    ],
                });
            } else {
                messages.push({ role: 'user', content: message });
            }

            const token = this.generateToken();

            const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    model: model,
                    messages,
                    temperature: 0.7,
                    max_tokens: 1024,
                }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new HttpException('⏳ Límite de rate alcanzado. Por favor espera un momento.', HttpStatus.TOO_MANY_REQUESTS);
                }
                const errorText = await response.text();
                // console.error('Zhipu API Error:', errorText); // Silent log
                throw new HttpException('Servicio de IA temporalmente no disponible', HttpStatus.SERVICE_UNAVAILABLE);
            }

            const data: ZhipuChatResponse = await response.json();
            let content = data.choices?.[0]?.message?.content || 'No se generó respuesta.';
            content = await this.ensureLanguageConsistency(content, message);

            // Check if AI wants to generate an image
            const imageMatch = content.match(/\[GENERATE_IMAGE:\s*(.+?)\]/);
            if (imageMatch) {
                const imagePrompt = imageMatch[1];
                const imageResult = await this.processImageGeneration(imagePrompt);
                content = content.replace(/\[GENERATE_IMAGE:\s*.+?\]/, '');
                return { response: content.trim(), generatedImage: imageResult.generatedImage };
            }

            // Cache the response (only for text-only messages)
            if (!imageUrl) {
                const cacheKey = this.getCacheKey(message + model);
                this.addToCache(cacheKey, content);
            }

            return { response: content };
        } finally {
            this.currentConcurrent--;
            this.processQueue();
        }
    }

    private async ensureLanguageConsistency(text: string, userMessage: string): Promise<string> {
        // Simple heuristic: if user doesn't use Chinese, response shouldn't either
        const hasChinese = /[\u4e00-\u9fa5]/.test(text);
        const userHasChinese = /[\u4e00-\u9fa5]/.test(userMessage);

        if (hasChinese && !userHasChinese) {
            console.warn('[Iris] Language mismatch detected (AI used Chinese). Cleaning characters.');
            // Remove Chinese characters
            return text.replace(/[\u4e00-\u9fa5]/g, '').trim();
        }

        return text;
    }

    private async processImageGeneration(prompt: string, model: string = 'cogview-3-plus'): Promise<{ response: string; generatedImage?: string }> {
        this.currentConcurrent++;
        this.requestTimestamps.push(Date.now());

        try {
            const token = this.generateToken();
            const response = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Ensure Bearer scheme
                },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    size: '1024x1024',
                }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    return { response: '⏳ Límite de rate alcanzado. Por favor espera un momento.' };
                }
                const error = await response.text();
                console.error('ZhipuAI Image API error:', error);
                return { response: '⚠️ No se pudo generar la imagen. Intenta de nuevo.' };
            }

            const data: ZhipuImageResponse = await response.json();
            const imageUrl = data.data?.[0]?.url;

            if (imageUrl) {
                return {
                    response: `🎨 **Imagen generada:**\n\n*Prompt:* "${prompt}"`,
                    generatedImage: imageUrl
                };
            }

            return { response: '⚠️ No se pudo generar la imagen.' };
        } finally {
            this.currentConcurrent--;
            this.processQueue();
        }
    }

    private async processQueue(): Promise<void> {
        if (this.requestQueue.length === 0 || !this.canProcessNow()) return;

        const next = this.requestQueue.shift();
        if (next) {
            try {
                let result;
                if (next.type === 'chat') {
                    result = await this.processChat(next.payload.message, next.payload.model, next.payload.imageUrl);
                } else {
                    result = await this.processImageGeneration(next.payload.prompt, next.payload.model);
                }
                next.resolve(result);
            } catch (error) {
                next.reject(error);
            }
        }
    }

    private getFallbackResponse(message: string): { response: string } {
        const lower = message.toLowerCase();

        if (lower.startsWith('/imagen') || lower.startsWith('/image')) {
            return { response: '🎨 Para generar imágenes, configura ZHIPU_API_KEY en el archivo .env' };
        }

        return {
            response: `🤖 Soy **Iris**, tu asistente de IA.\n\nPuedo ayudarte con:\n• 📊 Resúmenes de proyectos\n• ✉️ Redacción de emails\n• ⏰ Gestión de tareas\n• 💰 Generación de facturas\n• 🎨 Generación de imágenes (usa /imagen [descripción])\n\n*Configura ZHIPU_API_KEY para activar todas las funciones*`
        };
    }

    async getRateLimitStatus() {
        const now = Date.now();
        this.requestTimestamps = this.requestTimestamps.filter(t => now - t < 60000);

        return {
            currentConcurrent: this.currentConcurrent,
            maxConcurrent: this.maxConcurrent,
            requestsLastMinute: this.requestTimestamps.length,
            rpmLimit: this.rpmLimit,
            queueLength: this.requestQueue.length,
            cacheSize: this.responseCache.size,
            activeJobs: [...this.asyncJobs.values()].filter(j => j.status === 'PROCESSING').length,
            models: { chat: this.defaultChatModel, image: this.defaultImageModel },
        };
    }

    // ==================== PRIORITY QUEUE HELPERS ====================

    /**
     * Add request to priority queue (sorted by priority, then by createdAt)
     */
    private addToQueue(request: QueuedRequest): void {
        const priorityOrder = { HIGH: 0, NORMAL: 1, LOW: 2 };

        let insertIndex = this.requestQueue.length;
        for (let i = 0; i < this.requestQueue.length; i++) {
            const existing = this.requestQueue[i];
            if (priorityOrder[request.priority] < priorityOrder[existing.priority]) {
                insertIndex = i;
                break;
            }
            if (priorityOrder[request.priority] === priorityOrder[existing.priority] &&
                request.createdAt < existing.createdAt) {
                insertIndex = i;
                break;
            }
        }

        this.requestQueue.splice(insertIndex, 0, request);
    }

    // ==================== CACHE HELPERS ====================

    private getCacheKey(input: string): string {
        return crypto.createHash('md5').update(input.toLowerCase().trim()).digest('hex');
    }

    private getFromCache(key: string): string | null {
        const entry = this.responseCache.get(key);
        if (!entry) return null;

        if (Date.now() - entry.timestamp > this.CACHE_TTL) {
            this.responseCache.delete(key);
            return null;
        }

        entry.hits++;
        return entry.response;
    }

    private addToCache(key: string, response: string): void {
        if (this.responseCache.size >= this.MAX_CACHE_SIZE) {
            const oldest = [...this.responseCache.entries()]
                .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
            if (oldest) this.responseCache.delete(oldest[0]);
        }

        this.responseCache.set(key, {
            response,
            timestamp: Date.now(),
            hits: 0
        });
    }

    private cleanupCache(): void {
        const now = Date.now();
        for (const [key, entry] of this.responseCache.entries()) {
            if (now - entry.timestamp > this.CACHE_TTL) {
                this.responseCache.delete(key);
            }
        }
    }

    // ==================== ASYNC JOBS ====================

    async createAsyncJob(type: string, input: any): Promise<{ jobId: string }> {
        const jobId = crypto.randomUUID();
        const job: AsyncJob = {
            id: jobId,
            status: 'PENDING',
            type,
            input,
            createdAt: Date.now(),
        };

        this.asyncJobs.set(jobId, job);
        this.processAsyncJob(jobId).catch(console.error);

        return { jobId };
    }

    getJobStatus(jobId: string): AsyncJob | null {
        return this.asyncJobs.get(jobId) || null;
    }

    private async processAsyncJob(jobId: string): Promise<void> {
        const job = this.asyncJobs.get(jobId);
        if (!job) return;

        job.status = 'PROCESSING';

        try {
            let result;
            // Simple generic processing for now
            if (job.input && job.input.message) {
                result = await this.chat(job.input.message, job.input.imageUrl, job.input.model);
            } else {
                result = { response: 'Job processed' };
            }

            job.status = 'COMPLETED';
            job.result = result;
            job.completedAt = Date.now();
        } catch (error) {
            job.status = 'FAILED';
            job.error = error instanceof Error ? error.message : 'Unknown error';
            job.completedAt = Date.now();
        }
    }

    // ==================== RATE-LIMITED API HELPER ====================

    private async callApiWithRateLimit(messages: Array<{ role: string; content: string }>, temperature = 0.7): Promise<string> {
        while (!this.canProcessNow()) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.currentConcurrent++;
        this.requestTimestamps.push(Date.now());

        try {
            const token = this.generateToken();
            const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    model: this.defaultChatModel,
                    messages,
                    temperature,
                    max_tokens: 1024,
                }),
            });

            if (!response.ok) {
                if (response.status === 429) throw new Error('Rate limit exceeded');
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || '';
        } finally {
            this.currentConcurrent--;
            this.processQueue();
        }
    }

    // ==================== INTENT ANALYSIS ====================

    async analyzeIntent(message: string, context: string): Promise<{
        type: string;
        payload: any;
        confirmationText: string;
        reply: string;
    }> {
        if (!this.apiKey) {
            return {
                type: 'NONE',
                payload: {},
                confirmationText: 'API Key faltante',
                reply: 'Lo siento, necesito la API Key de ZhipuAI para analizar tu solicitud.'
            };
        }

        const actionPrompt = `
SYSTEM: You are Iris, the CRM Intent Analyzer.
OBJECTIVE: Map the user's message to a structured JSON action.

CONTEXT:
${context}

USER MESSAGE:
"${message}"

AVAILABLE ACTIONS:
- CREATE_TASK: { title, description?, projectId, priority?, dueDate? }
- UPDATE_TASK: { taskId, updates: { title?, status?, priority? } }
- CREATE_PROJECT: { name, clientId?, description? }
- CREATE_CLIENT: { name, company?, email? }
- CREATE_INVOICE: { clientId, items: [...] }
- NAVIGATE: { destination: "dashboard"|"projects"|"tasks"|"clients"|"finance" }
- NONE: (General conversation, questions, greeting)
- NEED_INFO: (If critical entity IDs or details are missing)

OUTPUT RULES:
1. Return ONLY valid JSON. No Markdown formatting, no code blocks.
2. If the user intention is unclear, default to NONE or NEED_INFO.
3. "reply" should be a natural, conversational confirmation of the action.

JSON STRUCTURE:
{
    "type": "ACTION_NAME",
    "payload": { ...arguments },
    "confirmationText": "Short technical description (e.g., 'Creating Task')",
    "reply": "Friendly response to user (e.g., 'I'll create that task for you.')"
}`;

        try {
            const text = await this.callApiWithRateLimit([
                { role: 'system', content: 'Responde solo con JSON válido, sin markdown.' },
                { role: 'user', content: actionPrompt }
            ], 0.3);
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

    // ==================== PREDICTIVE ANALYSIS ====================

    async generatePredictiveAnalysis(projectData: string): Promise<{
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        prediction: string;
        recommendation: string;
        impactedProjects: string[];
    }> {
        if (!this.apiKey) {
            return {
                riskLevel: 'LOW',
                prediction: 'Análisis no disponible sin API Key',
                recommendation: 'Configura ZHIPU_API_KEY para análisis predictivo',
                impactedProjects: []
            };
        }

        const analysisPrompt = `Analiza los siguientes datos del proyecto e identifica riesgos.

DATOS DEL PROYECTO:
${projectData}

INSTRUCCIONES (Chain of Thought):
Antes de responder, razona paso a paso:
1. Identifica los indicadores clave (progreso, presupuesto, plazos, recursos)
2. Compara el estado actual vs. lo esperado
3. Detecta señales de alerta temprana
4. Evalúa el impacto potencial de cada riesgo
5. Formula recomendaciones priorizadas

Después de tu análisis interno, responde SOLO con el siguiente JSON:
{
    "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "prediction": "Predicción detallada basada en tendencias y datos",
    "recommendation": "Acciones específicas y priorizadas",
    "impactedProjects": ["Lista de proyectos o áreas afectadas"]
}`;

        try {
            const text = await this.callApiWithRateLimit([
                { role: 'system', content: 'Responde solo con JSON válido.' },
                { role: 'user', content: analysisPrompt }
            ], 0.2);
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

    // ==================== EMAIL GENERATION ====================

    async generateEmail(recipient: string, purpose: string, context?: string): Promise<string> {
        const prompt = `Genera un email profesional:
- Destinatario: ${recipient}
- Propósito: ${purpose}
${context ? `- Contexto: ${context}` : ''}

El email debe ser profesional, conciso, con asunto claro.
Formato:
**Asunto:** [asunto]

[cuerpo del email]

Saludos cordiales,
[Tu nombre]`;

        const result = await this.chat(prompt);
        return result.response;
    }

    // ==================== PROJECT SUMMARY ====================

    async summarizeProject(projectData: string): Promise<string> {
        const prompt = `Resume el estado de este proyecto de forma ejecutiva:

${projectData}

Incluye:
- Estado general (1 línea)
- Progreso y métricas clave
- Próximos hitos
- Riesgos (si hay)

Usa markdown con emojis para claridad.`;

        const result = await this.chat(prompt);
        return result.response;
    }

    async analyzeEmail(
        text: string,
        type: 'summarize' | 'reply' | 'analyze',
        context: { subject: string; sender: string }
    ): Promise<string> {
        let systemPrompt = '';
        let userPrompt = '';

        if (type === 'summarize') {
            systemPrompt = `Eres un asistente ejecutivo experto. Tu tarea es resumir emails de forma extremadamente concisa para un CRM.
            - Extrae los puntos clave y cualquier acción requerida.
            - Máximo 3 líneas.
            - Usa bullet points si es necesario.
            - Ignora firmas y textos legales.`;
            userPrompt = `Email de: ${context.sender}\nAsunto: ${context.subject}\n\nContenido:\n${text}`;
        } else if (type === 'reply') {
            systemPrompt = `Eres un asistente de redacción de emails profesional. Genera una respuesta apropiada, cortés y profesional.
            - Mantén un tono de negocios pero cercano.
            - Si el email pide algo, confirma recepción o indica los pasos siguientes.
            - Sé conciso. No uses relleno innecesario.`;
            userPrompt = `Genera una respuesta para este email:\nDe: ${context.sender}\nAsunto: ${context.subject}\n\nContenido:\n${text}`;
        } else if (type === 'analyze') {
            systemPrompt = `Eres un analista de CRM. Analiza el email y extrae insights estructurados.
            Tu respuesta debe tener este formato exacto:
            URGENCY: [Low/Medium/High]
            SENTIMENT: [Positive/Neutral/Negative]
            INTENT: [Resumen de intencion en 5 palabras]
            ACTION: [Acción sugerida para el usuario]`;
            userPrompt = `Analiza este email:\nDe: ${context.sender}\nAsunto: ${context.subject}\n\nContenido:\n${text}`;
        }

        // Uses default chat model via callApiWithRateLimit or chat?
        // Let's use callApiWithRateLimit as it is structured for system/user interactions
        // But chat now supports model... let's stick to callApiWithRateLimit to avoid changing this method signature too much
        // or just update it to use chat
        const result = await this.callApiWithRateLimit([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]);
        return result;
    }

    /**
     * Get service status for providers endpoint
     */
    async getStatus() {
        const minimax = this.minimaxService.getStatus();
        const gemini = await this.geminiService.getStatus();
        const kimi = this.kimiService.getStatus();

        return {
            primary: minimax,
            secondary: kimi,
            tertiary: gemini,
            fallback: {
                model: this.defaultChatModel,
                configured: !!this.apiKey,
                priority: 'LOW'
            }
        };
    }
}

