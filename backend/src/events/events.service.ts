import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum EventType {
    MEETING = 'MEETING',
    DEADLINE = 'DEADLINE',
    REMINDER = 'REMINDER',
    CALL = 'CALL',
    PROJECT_MILESTONE = 'PROJECT_MILESTONE'
}

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: { start?: string; end?: string; userId?: string; projectId?: string; clientId?: string }) {
        const where: any = {};

        if (query.start || query.end) {
            where.startTime = {
                ...(query.start && { gte: new Date(query.start) }),
                ...(query.end && { lte: new Date(query.end) }),
            };
        }

        if (query.userId) where.createdById = query.userId;
        if (query.projectId) where.projectId = query.projectId;
        if (query.clientId) where.clientId = query.clientId;

        return (this.prisma as any).event.findMany({
            where,
            include: {
                project: { select: { id: true, name: true } },
                client: { select: { id: true, company: true } },
                createdBy: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { startTime: 'asc' },
        });
    }

    async findOne(id: string) {
        const event = await (this.prisma as any).event.findUnique({
            where: { id },
            include: {
                project: true,
                client: true,
                createdBy: { select: { id: true, name: true, avatar: true } },
            },
        });
        if (!event) throw new NotFoundException('Event not found');
        return event;
    }

    async create(data: any, userId: string) {
        return (this.prisma as any).event.create({
            data: {
                title: data.title,
                description: data.description,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
                allDay: data.allDay || false,
                type: data.type as EventType,
                color: data.color,
                projectId: data.projectId || null,
                clientId: data.clientId || null,
                createdById: userId,
            },
            include: {
                project: { select: { id: true, name: true } },
                client: { select: { id: true, company: true } },
                createdBy: { select: { id: true, name: true } },
            },
        });
    }

    async update(id: string, data: any) {
        return (this.prisma as any).event.update({
            where: { id },
            data: {
                ...data,
                ...(data.startTime && { startTime: new Date(data.startTime) }),
                ...(data.endTime && { endTime: new Date(data.endTime) }),
            },
            include: {
                project: { select: { id: true, name: true } },
                client: { select: { id: true, company: true } },
            },
        });
    }

    async delete(id: string) {
        return (this.prisma as any).event.delete({ where: { id } });
    }
}
