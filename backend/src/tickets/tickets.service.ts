import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class TicketsService {
    constructor(private prisma: PrismaService) { }

    private buildWhereClause(user: any) {
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            return {};
        }

        if (user.role === 'CLIENT') {
            return { reporterId: user.id };
        }

        if (user.role === 'WORKER') {
            return {
                OR: [
                    { assignedToId: user.id },
                    { reporterId: user.id },
                ],
            };
        }

        return { id: '__forbidden__' };
    }

    async findAll(user: any) {
        const whereClause = this.buildWhereClause(user);

        return this.prisma.ticket.findMany({
            where: whereClause,
            include: {
                reporter: { select: { id: true, name: true, email: true, avatar: true } },
                assignedTo: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, user: any) {
        const whereClause = this.buildWhereClause(user);
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                AND: [
                    { id },
                    whereClause,
                ],
            },
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

    async update(id: string, data: any, user: any) {
        await this.findOne(id, user);
        return this.prisma.ticket.update({
            where: { id },
            data,
            include: {
                reporter: { select: { id: true, name: true } },
                assignedTo: { select: { id: true, name: true } },
            },
        });
    }

    async updateStatus(id: string, status: string, user: any) {
        await this.findOne(id, user);
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

    async assignTo(id: string, assignedToId: string, user: any) {
        await this.findOne(id, user);
        return this.prisma.ticket.update({
            where: { id },
            data: { assignedToId },
            include: {
                assignedTo: { select: { id: true, name: true } },
            },
        });
    }

    async delete(id: string, user: any) {
        await this.findOne(id, user);
        return this.prisma.ticket.delete({ where: { id } });
    }

    async getStats(user: any) {
        const whereClause = this.buildWhereClause(user);

        const [total, open, inProgress, resolved] = await Promise.all([
            this.prisma.ticket.count({ where: whereClause }),
            this.prisma.ticket.count({ where: { AND: [whereClause, { status: 'OPEN' }] } }),
            this.prisma.ticket.count({ where: { AND: [whereClause, { status: 'IN_PROGRESS' }] } }),
            this.prisma.ticket.count({ where: { AND: [whereClause, { status: 'RESOLVED' }] } }),
        ]);

        return {
            total,
            byStatus: { open, inProgress, resolved },
            avgResolutionTime: '2.5 days',
        };
    }
}
