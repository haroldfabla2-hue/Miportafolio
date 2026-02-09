import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) { }

    async findAll(user: any) {
        let whereClause: Prisma.ClientWhereInput = {};

        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            whereClause = {};
        } else if (user.role === 'CLIENT') {
            whereClause = { email: user.email };
        } else if (user.role === 'WORKER') {
            whereClause = {
                projects: {
                    some: {
                        OR: [
                            { team: { some: { id: user.id } } },
                            { managerId: user.id },
                        ],
                    },
                },
            };
        } else {
            return [];
        }

        return this.prisma.client.findMany({
            where: whereClause,
            include: { projects: true },
        });
    }

    async findOne(id: string) {
        const client = await this.prisma.client.findUnique({
            where: { id },
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

    async update(id: string, data: Prisma.ClientUpdateInput) {
        return this.prisma.client.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.client.delete({ where: { id } });
    }
}
