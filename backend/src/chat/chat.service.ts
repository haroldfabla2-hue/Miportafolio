import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    async getChannels(userId: string) {
        return this.prisma.channel.findMany({
            where: {
                OR: [
                    { isPrivate: false },
                    { members: { some: { userId } } },
                ],
            },
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

    async getChannel(channelId: string) {
        const channel = await this.prisma.channel.findUnique({
            where: { id: channelId },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, avatar: true } } },
                },
            },
        });
        if (!channel) throw new NotFoundException('Channel not found');
        return channel;
    }

    async getMessages(channelId: string, limit = 50, before?: string) {
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

    async sendMessage(channelId: string, userId: string, content: string) {
        const message = await this.prisma.chatMessage.create({
            data: {
                content,
                channelId,
                senderId: userId,
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

    async createChannel(data: { name: string; description?: string; isPrivate?: boolean; projectId?: string; memberIds?: string[] }) {
        const channel = await this.prisma.channel.create({
            data: {
                name: data.name,
                description: data.description,
                isPrivate: data.isPrivate ?? false,
                projectId: data.projectId,
                members: data.memberIds ? {
                    create: data.memberIds.map(userId => ({ userId })),
                } : undefined,
            },
            include: {
                members: { include: { user: { select: { id: true, name: true } } } },
            },
        });
        return channel;
    }

    async addMember(channelId: string, userId: string) {
        return this.prisma.channelMember.create({
            data: { channelId, userId },
        });
    }

    async removeMember(channelId: string, userId: string) {
        return this.prisma.channelMember.deleteMany({
            where: { channelId, userId },
        });
    }
}
