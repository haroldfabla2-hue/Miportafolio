import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) { }

    private buildWhereClause(user: any): Prisma.ClientWhereInput {
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            return {};
        } else if (user.role === 'CLIENT') {
            return { email: user.email };
        } else if (user.role === 'WORKER') {
            return {
                projects: {
                    some: {
                        OR: [
                            { team: { some: { id: user.id } } },
                            { managerId: user.id },
                        ],
                    },
                },
            };
        }

        return { id: '__forbidden__' };
    }

    async findAll(user: any) {
        const whereClause = this.buildWhereClause(user);

        return this.prisma.client.findMany({
            where: whereClause,
            include: { projects: true },
        });
    }

    async findOne(id: string, user: any) {
        const whereClause = this.buildWhereClause(user);
        const client = await this.prisma.client.findFirst({
            where: {
                AND: [
                    { id },
                    whereClause,
                ],
            },
            include: { projects: true },
        });
        if (!client) throw new NotFoundException('Client not found');
        return client;
    }

    async create(data: Prisma.ClientCreateInput) {
        try {
            return await this.prisma.client.create({ data });
        } catch (error) {
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                throw new ConflictException('Email already exists for another client');
            }
            throw error;
        }
    }

    async update(id: string, data: Prisma.ClientUpdateInput, user: any) {
        await this.findOne(id, user);
        return this.prisma.client.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, user: any) {
        await this.findOne(id, user);
        return this.prisma.client.delete({ where: { id } });
    }
}
