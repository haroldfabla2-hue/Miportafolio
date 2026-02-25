import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    private isAdmin(user: any): boolean {
        return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    }

    private async getAccessibleChannel(channelId: string, user: any) {
        const where = this.isAdmin(user)
            ? { id: channelId }
            : {
                id: channelId,
                members: { some: { userId: user.id } },
            };

        const channel = await this.prisma.channel.findFirst({
            where,
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, avatar: true } } },
                },
            },
        });

        if (!channel) {
            throw new NotFoundException('Channel not found');
        }

        return channel;
    }

    async getChannels(user: any) {
        const where = this.isAdmin(user)
            ? {}
            : { members: { some: { userId: user.id } } };

        return this.prisma.channel.findMany({
            where,
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, avatar: true } } },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async getChannel(channelId: string, user: any) {
        return this.getAccessibleChannel(channelId, user);
    }

    async getMessages(channelId: string, user: any, limit = 50, before?: string) {
        await this.getAccessibleChannel(channelId, user);

        return this.prisma.chatMessage.findMany({
            where: {
                channelId,
                ...(before ? { createdAt: { lt: new Date(before) } } : {}),
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async sendMessage(channelId: string, user: any, content: string) {
        await this.getAccessibleChannel(channelId, user);

        const message = await this.prisma.chatMessage.create({
            data: {
                content,
                channelId,
                senderId: user.id,
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
            },
        });

        // Update channel's updatedAt
        await this.prisma.channel.update({
            where: { id: channelId },
            data: { updatedAt: new Date() },
        });

        return message;
    }

    async createChannel(data: { name: string; description?: string; isPrivate?: boolean; projectId?: string; memberIds?: string[] }, user: any) {
        const memberIds = new Set<string>(data.memberIds || []);
        memberIds.add(user.id);

        const channel = await this.prisma.channel.create({
            data: {
                name: data.name,
                description: data.description,
                isPrivate: data.isPrivate ?? false,
                projectId: data.projectId,
                members: {
                    create: Array.from(memberIds).map(userId => ({ userId })),
                },
            },
            include: {
                members: { include: { user: { select: { id: true, name: true } } } },
            },
        });
        return channel;
    }

    private async assertCanManageChannel(channelId: string, actingUser: any) {
        if (this.isAdmin(actingUser)) {
            return;
        }

        const isMember = await this.prisma.channelMember.findFirst({
            where: { channelId, userId: actingUser.id },
            select: { id: true },
        });

        if (!isMember) {
            throw new ForbiddenException('You do not have access to manage this channel');
        }
    }

    async addMember(channelId: string, userId: string, actingUser: any) {
        await this.assertCanManageChannel(channelId, actingUser);

        const existing = await this.prisma.channelMember.findFirst({
            where: { channelId, userId },
            select: { id: true },
        });

        if (existing) {
            return existing;
        }

        return this.prisma.channelMember.create({
            data: { channelId, userId },
        });
    }

    async removeMember(channelId: string, userId: string, actingUser: any) {
        await this.assertCanManageChannel(channelId, actingUser);
        return this.prisma.channelMember.deleteMany({
            where: { channelId, userId },
        });
    }
}
