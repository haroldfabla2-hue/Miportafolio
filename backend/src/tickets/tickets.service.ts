import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class TicketsService {
    constructor(private prisma: PrismaService) { }

    async findAll(user: any) {
        let whereClause: any = {};

        if (user.role === 'CLIENT') {
            whereClause = { reporterId: user.id };
        } else if (user.role === 'WORKER') {
            whereClause = {
                OR: [
                    { assignedToId: user.id },
                    { reporterId: user.id },
                ],
            };
        }
        // ADMIN and SUPER_ADMIN see all tickets

        return this.prisma.ticket.findMany({
            where: whereClause,
            include: {
                reporter: { select: { id: true, name: true, email: true, avatar: true } },
                assignedTo: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
            include: {
                reporter: { select: { id: true, name: true, email: true, avatar: true } },
                assignedTo: { select: { id: true, name: true, avatar: true } },
            },
        });
        if (!ticket) throw new NotFoundException('Ticket not found');
        return ticket;
    }

    async create(data: any, userId: string) {
        return this.prisma.ticket.create({
            data: {
                subject: data.subject || data.title,
                description: data.description,
                priority: data.priority || 'MEDIUM',
                category: data.category,
                reporterId: userId,
                assignedToId: data.assignedToId,
            },
            include: {
                reporter: { select: { id: true, name: true } },
            },
        });
    }

    async update(id: string, data: any) {
        return this.prisma.ticket.update({
            where: { id },
            data,
            include: {
                reporter: { select: { id: true, name: true } },
                assignedTo: { select: { id: true, name: true } },
            },
        });
    }

    async updateStatus(id: string, status: string) {
        const resolvedAt = status === 'RESOLVED' ? new Date() : null;
        return this.prisma.ticket.update({
            where: { id },
            data: {
                status: status as TicketStatus,
                resolvedAt
            },
            include: {
                reporter: { select: { id: true, name: true } },
                assignedTo: { select: { id: true, name: true } },
            },
        });
    }

    async assignTo(id: string, assignedToId: string) {
        return this.prisma.ticket.update({
            where: { id },
            data: { assignedToId },
            include: {
                assignedTo: { select: { id: true, name: true } },
            },
        });
    }

    async delete(id: string) {
        return this.prisma.ticket.delete({ where: { id } });
    }

    async getStats() {
        const [total, open, inProgress, resolved] = await Promise.all([
            this.prisma.ticket.count(),
            this.prisma.ticket.count({ where: { status: 'OPEN' } }),
            this.prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
            this.prisma.ticket.count({ where: { status: 'RESOLVED' } }),
        ]);

        return {
            total,
            byStatus: { open, inProgress, resolved },
            avgResolutionTime: '2.5 days',
        };
    }
}
