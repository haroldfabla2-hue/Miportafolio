import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class ProjectsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async findAll(user: any) {
        let whereClause: Prisma.ProjectWhereInput = {};

        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            whereClause = {};
        } else if (user.role === 'WORKER') {
            whereClause = {
                OR: [
                    { managerId: user.id },
                    { team: { some: { id: user.id } } },
                ],
            };
        } else if (user.role === 'CLIENT') {
            whereClause = { client: { email: user.email } };
        } else {
            return [];
        }

        const projects = await this.prisma.project.findMany({
            where: whereClause,
            include: {
                client: true,
                team: true,
                timeLogs: { include: { user: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Calculate Financials
        return projects.map((p) => {
            const spent = p.timeLogs.reduce((acc, log) => {
                const hours = log.durationMinutes / 60;
                const rate = (log.user as any).hourlyRate || 0;
                return acc + hours * rate;
            }, 0);

            const { timeLogs, ...projectData } = p;
            return { ...projectData, spent };
        });
    }

    async findOne(id: string) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                client: true,
                team: true,
                tasks: true,
                timeLogs: { include: { user: true } },
                assets: true,
            },
        });

        if (!project) throw new NotFoundException('Project not found');

        const spent = project.timeLogs.reduce((acc, log) => {
            const hours = log.durationMinutes / 60;
            const rate = (log.user as any).hourlyRate || 0;
            return acc + hours * rate;
        }, 0);

        return { ...project, spent };
    }

    async create(data: any) {
        // Simplified creation for now - Assuming data is already DTO validated or clean
        // In a real scenario, we'd handle the Date parsing here if DTO doesn't
        const { teamIds, managerId, clientId, ...rest } = data;

        const newProject = await this.prisma.project.create({
            data: {
                ...rest,
                client: { connect: { id: clientId } },
                manager: managerId ? { connect: { id: managerId } } : undefined,
                team: teamIds ? { connect: teamIds.map((id: string) => ({ id })) } : undefined,
            },
            include: { client: true }
        });

        // Emit Socket Event (Placeholder)
        this.autoCreateChat(newProject, teamIds, managerId);

        return newProject;
    }

    private async autoCreateChat(project: any, teamIds: string[], managerId: string) {
        try {
            const participantIds = new Set<string>();
            if (managerId) participantIds.add(managerId);
            if (teamIds) teamIds.forEach((id) => participantIds.add(id));

            await this.prisma.channel.create({
                data: {
                    name: `# ${project.name}`,
                    // isGroup property check in schema: defaults to false? Model 'Channel' has 'isPrivate' Boolean @default(false).
                    // Logic port says 'isGroup: true', implying it's a team channel.
                    // Adapting to current Schema: 'Channel'
                    isPrivate: false,
                    projectId: project.id,
                    members: {
                        create: Array.from(participantIds).map(userId => ({ userId }))
                    }
                }
            });
        } catch (error) {
            console.error('Failed to auto-create chat', error);
        }
    }

    async update(id: string, data: any) {
        const { teamIds, managerId, clientId, ...rest } = data;

        const updatedProject = await this.prisma.project.update({
            where: { id },
            data: {
                ...rest,
                client: clientId ? { connect: { id: clientId } } : undefined,
                manager: managerId ? { connect: { id: managerId } } : undefined,
                team: teamIds ? { set: teamIds.map((tid: string) => ({ id: tid })) } : undefined,
            },
            include: { client: true, manager: true, team: true }
        });

        // Trigger Notification on Status Change
        if (data.status) {
            // Notify Manager
            if (updatedProject.managerId) {
                await this.notificationsService.create({
                    userId: updatedProject.managerId,
                    title: 'Project Updated',
                    message: `Project "${updatedProject.name}" status is now ${data.status}`,
                    type: 'INFO',
                    entityType: 'PROJECT',
                    entityId: updatedProject.id
                });
            }
            // Notify Team
            updatedProject.team.forEach(async (member) => {
                if (member.id !== updatedProject.managerId) {
                    await this.notificationsService.create({
                        userId: member.id,
                        title: 'Project Updated',
                        message: `Project "${updatedProject.name}" status is now ${data.status}`,
                        type: 'INFO',
                        entityType: 'PROJECT',
                        entityId: updatedProject.id
                    });
                }
            });
        }

        return updatedProject;
    }

    async remove(id: string) {
        return this.prisma.project.delete({ where: { id } });
    }
}

