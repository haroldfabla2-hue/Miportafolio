import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadStatus } from '@prisma/client';

@Injectable()
export class LeadsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.lead.findMany({
            include: {
                assignedTo: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByStatus(status: LeadStatus) {
        return this.prisma.lead.findMany({
            where: { status },
            include: {
                assignedTo: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: {
                assignedTo: true,
            },
        });
        if (!lead) throw new NotFoundException('Lead not found');
        return lead;
    }

    async create(data: any) {
        return this.prisma.lead.create({
            data: {
                name: data.name || data.contactName,
                company: data.company,
                email: data.email,
                phone: data.phone,
                value: data.value || 0,
                status: data.status || 'NEW',
                source: data.source,
                notes: data.notes,
                assignedToId: data.assignedToId,
            },
            include: {
                assignedTo: { select: { id: true, name: true } },
            },
        });
    }

    async update(id: string, data: any) {
        return this.prisma.lead.update({
            where: { id },
            data,
            include: {
                assignedTo: { select: { id: true, name: true } },
            },
        });
    }

    async updateStatus(id: string, status: string) {
        return this.prisma.lead.update({
            where: { id },
            data: {
                status: status as LeadStatus,
            },
            include: {
                assignedTo: { select: { id: true, name: true } },
            },
        });
    }

    async delete(id: string) {
        return this.prisma.lead.delete({ where: { id } });
    }

    async getStats() {
        const leads = await this.prisma.lead.findMany();

        const byStatus = leads.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);

        return {
            total: leads.length,
            byStatus,
            totalValue,
            won: leads.filter(l => l.status === 'WON').length,
            lost: leads.filter(l => l.status === 'LOST').length,
        };
    }
}
