import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { IrisService } from './iris.service';
import { KimiService } from './kimi.service';
import { GeminiService } from './gemini.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('iris')
@UseGuards(JwtAuthGuard, AdminGuard)
export class IrisController {
    constructor(
        private readonly irisService: IrisService,
        private readonly kimiService: KimiService,
        private readonly geminiService: GeminiService,
    ) { }

    @Post('chat')
    async chat(@Body() body: { message: string; imageUrl?: string; model?: string }, @Req() req: any) {
        return this.irisService.chat(body.message, body.imageUrl, body.model, req.user);
    }

    @Post('analyze-intent')
    async analyzeIntent(@Body() body: { message: string; context: string }) {
        return this.irisService.analyzeIntent(body.message, body.context);
    }

    @Post('predictive-analysis')
    async predictiveAnalysis(@Body() body: { projectData: string }) {
        return this.irisService.generatePredictiveAnalysis(body.projectData);
    }

    @Post('generate-email')
    async generateEmail(@Body() body: { recipient: string; purpose: string; context?: string }) {
        return { email: await this.irisService.generateEmail(body.recipient, body.purpose, body.context) };
    }

    @Post('summarize-project')
    async summarizeProject(@Body() body: { projectData: string }) {
        return { summary: await this.irisService.summarizeProject(body.projectData) };
    }

    @Post('email-analysis')
    async analyzeEmail(@Body() body: { text: string; type: 'summarize' | 'reply' | 'analyze'; context: { subject: string; sender: string } }) {
        try {
            const result = await this.irisService.analyzeEmail(body.text, body.type, body.context);
            return { result };
        } catch (error) {
            console.error('Email analysis failed:', error);
            // Return safe fallback or rethrow
            throw error;
        }
    }

    @Post('generate-image')
    async generateImage(@Body() body: { prompt: string; model?: string }) {
        return this.irisService.generateImage(body.prompt, body.model);
    }

    // ==================== ASYNC JOBS ====================

    @Post('jobs')
    async createJob(@Body() body: { type: string; input: any }) {
        return this.irisService.createAsyncJob(body.type, body.input);
    }

    @Get('jobs/:jobId')
    async getJobStatus(@Param('jobId') jobId: string) {
        const job = this.irisService.getJobStatus(jobId);
        if (!job) {
            return { error: 'Job not found' };
        }
        return job;
    }

    @Get('status')
    async getRateLimitStatus() {
        return this.irisService.getRateLimitStatus();
    }

    @Get('providers')
    async getAIProviders() {
        return {
            providers: [
                { ...this.kimiService.getStatus(), order: 1 },
                { provider: 'Zhipu AI - GLM', ...await this.irisService.getStatus(), order: 2 },
                { ...await this.geminiService.getStatus(), order: 3 },
            ],
            cascade: 'Kimi K2.5 → GLM-4.7 → Gemini',
            description: 'If primary fails, automatically tries next provider'
        };
    }
}


