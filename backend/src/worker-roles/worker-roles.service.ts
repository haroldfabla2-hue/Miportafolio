import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Default roles to seed
const DEFAULT_ROLES = [
    {
        name: 'Full Access',
        description: 'Full access to all features (for managers)',
        color: '#10b981',
        isSystem: true,
        permissions: [
            'dashboard:view', 'projects:view', 'projects:create', 'projects:edit', 'projects:delete',
            'tasks:view', 'tasks:create', 'tasks:edit', 'tasks:delete',
            'clients:view', 'clients:manage', 'team:view', 'team:manage',
            'finance:view', 'finance:manage', 'pipeline:view', 'pipeline:manage',
            'messages:access', 'email:access', 'files:access', 'assets:access',
            'iris:access', 'tickets:view', 'tickets:manage', 'settings:view',
        ],
    },
    {
        name: 'Developer',
        description: 'Access to projects, tasks, and development tools',
        color: '#6366f1',
        isSystem: true,
        permissions: [
            'dashboard:view', 'projects:view', 'projects:edit',
            'tasks:view', 'tasks:create', 'tasks:edit',
            'messages:access', 'files:access', 'iris:access',
        ],
    },
    {
        name: 'Designer',
        description: 'Access to projects, tasks, and creative assets',
        color: '#ec4899',
        isSystem: true,
        permissions: [
            'dashboard:view', 'projects:view',
            'tasks:view', 'tasks:create', 'tasks:edit',
            'messages:access', 'files:access', 'assets:access', 'iris:access',
        ],
    },
    {
        name: 'Accountant',
        description: 'Access to finances and client billing',
        color: '#f59e0b',
        isSystem: true,
        permissions: [
            'dashboard:view', 'clients:view', 'finance:view', 'finance:manage', 'pipeline:view',
        ],
    },
    {
        name: 'Support',
        description: 'Access to tickets and customer communication',
        color: '#3b82f6',
        isSystem: true,
        permissions: [
            'dashboard:view', 'clients:view', 'messages:access', 'email:access',
            'tickets:view', 'tickets:manage',
        ],
    },
];

@Injectable()
export class WorkerRolesService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        await this.seedDefaultRoles();
    }

    async seedDefaultRoles() {
        console.log('👔 Seeding default worker roles...');

        for (const roleData of DEFAULT_ROLES) {
            const existingRole = await this.prisma.workerRole.findUnique({
                where: { name: roleData.name },
            });

            if (!existingRole) {
                // Create role
                const role = await this.prisma.workerRole.create({
                    data: {
                        name: roleData.name,
                        description: roleData.description,
                        color: roleData.color,
                        isSystem: roleData.isSystem,
                    },
                });

                // Assign permissions
                const permissions = await this.prisma.permission.findMany({
                    where: { code: { in: roleData.permissions } },
                });

                for (const perm of permissions) {
                    await this.prisma.rolePermission.create({
                        data: {
                            roleId: role.id,
                            permissionId: perm.id,
                        },
                    });
                }

                console.log(`✅ Role created: ${roleData.name}`);
            }
        }

        console.log('✅ Worker roles seeded');
    }

    async findAll() {
        return this.prisma.workerRole.findMany({
            include: {
                permissions: {
                    include: { permission: true },
                },
                _count: { select: { users: true } },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const role = await this.prisma.workerRole.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: { permission: true },
                },
                users: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
            },
        });

        if (!role) {
            throw new NotFoundException('Worker role not found');
        }

        return role;
    }

    async create(data: { name: string; description?: string; color?: string; permissionCodes?: string[] }) {
        // Check if name already exists
        const existing = await this.prisma.workerRole.findUnique({
            where: { name: data.name },
        });

        if (existing) {
            throw new BadRequestException('A role with this name already exists');
        }

        // Create role
        const role = await this.prisma.workerRole.create({
            data: {
                name: data.name,
                description: data.description,
                color: data.color || '#6366f1',
            },
        });

        // Assign permissions if provided
        if (data.permissionCodes && data.permissionCodes.length > 0) {
            const permissions = await this.prisma.permission.findMany({
                where: { code: { in: data.permissionCodes } },
            });

            for (const perm of permissions) {
                await this.prisma.rolePermission.create({
                    data: {
                        roleId: role.id,
                        permissionId: perm.id,
                    },
                });
            }
        }

        return this.findOne(role.id);
    }

    async update(id: string, data: { name?: string; description?: string; color?: string; permissionCodes?: string[] }) {
        const role = await this.prisma.workerRole.findUnique({ where: { id } });

        if (!role) {
            throw new NotFoundException('Worker role not found');
        }

        if (role.isSystem && data.name && data.name !== role.name) {
            throw new BadRequestException('Cannot rename system roles');
        }

        // Update basic info
        await this.prisma.workerRole.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                color: data.color,
            },
        });

        // Update permissions if provided
        if (data.permissionCodes !== undefined) {
            // Remove all existing permissions
            await this.prisma.rolePermission.deleteMany({
                where: { roleId: id },
            });

            // Add new permissions
            if (data.permissionCodes.length > 0) {
                const permissions = await this.prisma.permission.findMany({
                    where: { code: { in: data.permissionCodes } },
                });

                for (const perm of permissions) {
                    await this.prisma.rolePermission.create({
                        data: {
                            roleId: id,
                            permissionId: perm.id,
                        },
                    });
                }
            }
        }

        return this.findOne(id);
    }

    async delete(id: string) {
        const role = await this.prisma.workerRole.findUnique({ where: { id } });

        if (!role) {
            throw new NotFoundException('Worker role not found');
        }

        if (role.isSystem) {
            throw new BadRequestException('Cannot delete system roles');
        }

        // Remove role from all users first
        await this.prisma.user.updateMany({
            where: { workerRoleId: id },
            data: { workerRoleId: null },
        });

        // Delete role (cascade will delete RolePermissions)
        await this.prisma.workerRole.delete({ where: { id } });

        return { success: true, message: 'Role deleted' };
    }

    async assignToUser(userId: string, roleId: string | null) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role !== 'WORKER') {
            throw new BadRequestException('Worker roles can only be assigned to WORKER users');
        }

        if (roleId) {
            const role = await this.prisma.workerRole.findUnique({ where: { id: roleId } });
            if (!role) {
                throw new NotFoundException('Worker role not found');
            }
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: { workerRoleId: roleId },
            include: {
                workerRole: {
                    include: {
                        permissions: { include: { permission: true } },
                    },
                },
            },
        });
    }
}
