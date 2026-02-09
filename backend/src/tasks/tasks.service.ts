import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async findAll(user: any) {
        let whereClause: Prisma.TaskWhereInput = {};

        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            // Admin sees all tasks
            whereClause = {};
        } else if (user.role === 'WORKER') {
            // Workers see tasks assigned to them or on projects they're part of
            whereClause = {
                OR: [
                    { assigneeId: user.id },
                    { project: { team: { some: { id: user.id } } } },
                    { project: { managerId: user.id } },
                ],
            };
        } else if (user.role === 'CLIENT') {
            // Clients see tasks on their projects
            whereClause = {
                project: { client: { email: user.email } },
            };
        } else {
            return [];
        }

        try {
            return await this.prisma.task.findMany({
                where: whereClause,
                include: {
                    project: { select: { id: true, name: true } },
                    assignee: { select: { id: true, name: true, avatar: true } },
                },
                orderBy: { updatedAt: 'desc' },
            });
        } catch (error) {
            console.error('TasksService.findAll Error:', error);
            throw error;
        }
    }

    async findOne(id: string) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                project: true,
                assignee: true,
            },
        });
        if (!task) throw new NotFoundException('Task not found');
        return task;
    }

    async findByProject(projectId: string) {
        return this.prisma.task.findMany({
            where: { projectId },
            include: {
                assignee: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async create(data: any) {
        const { projectId, assigneeId, ...rest } = data;

        const task = await this.prisma.task.create({
            data: {
                ...rest,
                dueDate: rest.dueDate ? new Date(rest.dueDate) : undefined,
                project: { connect: { id: projectId } },
                assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
            },
            include: {
                project: { select: { id: true, name: true } },
                assignee: { select: { id: true, name: true, avatar: true } },
            },
        });

        // Notify Assignee
        if (assigneeId) {
            await this.notificationsService.create({
                userId: assigneeId,
                title: 'New Task Assigned',
                message: `You have been assigned to task "${task.title}" in project "${task.project.name}"`,
                type: 'INFO',
                entityType: 'TASK',
                entityId: task.id
            });
        }

        return task;
    }

    async update(id: string, data: any) {
        const { projectId, assigneeId, ...rest } = data;

        // Prepare update data
        const updateData: any = { ...rest };
        if (rest.dueDate) updateData.dueDate = new Date(rest.dueDate);
        if (assigneeId) updateData.assignee = { connect: { id: assigneeId } };
        if (assigneeId === null) updateData.assignee = { disconnect: true };

        return this.prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                project: { select: { id: true, name: true } },
                assignee: { select: { id: true, name: true, avatar: true } },
            },
        });
    }

    async updateStatus(id: string, status: string) {
        return this.prisma.task.update({
            where: { id },
            data: { status },
            include: {
                project: { select: { id: true, name: true } },
                assignee: { select: { id: true, name: true, avatar: true } },
            },
        });
    }

    async remove(id: string) {
        return this.prisma.task.delete({ where: { id } });
    }

    async getTaskStats(user: any) {
        let whereClause: Prisma.TaskWhereInput = {};

        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            whereClause = {};
        } else if (user.role === 'WORKER') {
            whereClause = {
                OR: [
                    { assigneeId: user.id },
                    { project: { team: { some: { id: user.id } } } },
                    { project: { managerId: user.id } },
                ],
            };
        } else if (user.role === 'CLIENT') {
            whereClause = {
                project: { client: { email: user.email } },
            };
        } else {
            return { total: 0, completed: 0, pending: 0, byStatus: [], productivity: [] };
        }

        const [total, completed, pending, byStatusRaw] = await Promise.all([
            this.prisma.task.count({ where: whereClause }),
            this.prisma.task.count({ where: { ...whereClause, status: 'DONE' } }),
            this.prisma.task.count({ where: { ...whereClause, status: { not: 'DONE' } } }),
            this.prisma.task.groupBy({
                by: ['status'],
                where: whereClause,
                _count: { id: true }
            })
        ]);

        const byStatus = byStatusRaw.map(item => ({ status: item.status, count: item._count.id }));

        // Productivity (Top 5 assignees by completed tasks)
        let productivity: any[] = [];
        if (user.role !== 'CLIENT') {
            const topPerformers = await this.prisma.task.groupBy({
                by: ['assigneeId'],
                where: { ...whereClause, status: 'DONE', assigneeId: { not: null } },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 5
            });

            // Fetch names manually since groupBy doesn't support include
            const userIds = topPerformers.map(p => p.assigneeId).filter((id): id is string => id !== null);
            if (userIds.length > 0) {
                const users = await this.prisma.user.findMany({
                    where: { id: { in: userIds } },
                    select: { id: true, name: true, avatar: true }
                });

                productivity = topPerformers.map(p => {
                    const u = users.find(user => user.id === p.assigneeId);
                    return {
                        name: u ? u.name : 'Unknown',
                        avatar: u ? u.avatar : null,
                        completedTasks: p._count.id
                    };
                });
            }
        }

        return { total, completed, pending, byStatus, productivity };
    }
}
