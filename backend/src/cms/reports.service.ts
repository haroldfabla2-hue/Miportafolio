import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IrisService } from '../iris/iris.service';

@Injectable()
export class ReportsService {
    constructor(
        private prisma: PrismaService,
        private irisService: IrisService,
    ) { }

    async getAllReports() {
        return this.prisma.cmsContent.findMany({
            where: { type: 'REPORT' },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getReport(id: string) {
        const report = await this.prisma.cmsContent.findUnique({
            where: { id },
        });
        if (!report) throw new NotFoundException('Report not found');
        return report;
    }

    async generateReport(type: string, prompt: string, userId: string) {
        // Collect context based on type
        let context = '';
        if (type === 'FINANCIAL') {
            const invoices = await this.prisma.invoice.findMany({ take: 50, orderBy: { createdAt: 'desc' } });
            const bills = await this.prisma.bill.findMany({ take: 50, orderBy: { createdAt: 'desc' } });
            context = `Recent Invoices: ${JSON.stringify(invoices)}\nRecent Bills: ${JSON.stringify(bills)}`;
        } else if (type === 'PERFORMANCE') {
            const tasks = await this.prisma.task.findMany({ take: 100, orderBy: { updatedAt: 'desc' } });
            context = `Recent Tasks Status: ${JSON.stringify(tasks)}`;
        }

        const aiResponse = await this.irisService.askIris(
            `You are a Business Intelligence expert. Generate a detailed ${type} report based on this data: ${context}. User prompt: ${prompt}`,
            'REPORT_GENERATOR'
        );

        const title = `${type} Report - ${new Date().toLocaleDateString()}`;
        const slug = `report-${type.toLowerCase()}-${Date.now()}`;

        return this.prisma.cmsContent.create({
            data: {
                title,
                slug,
                type: 'REPORT',
                content: aiResponse,
                status: 'PUBLISHED',
                publishedAt: new Date(),
                metadata: {
                    generatedBy: userId,
                    reportType: type,
                    originalPrompt: prompt
                }
            }
        });
    }

    async deleteReport(id: string) {
        return this.prisma.cmsContent.delete({
            where: { id, type: 'REPORT' }
        });
    }
}
