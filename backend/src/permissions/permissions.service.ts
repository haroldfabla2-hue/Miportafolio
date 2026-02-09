import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Define all system permissions
export const SYSTEM_PERMISSIONS = [
    // Dashboard
    { code: 'dashboard:view', name: 'View Dashboard', category: 'Dashboard', description: 'Access to main dashboard' },

    // Projects
    { code: 'projects:view', name: 'View Projects', category: 'Projects', description: 'View project list and details' },
    { code: 'projects:create', name: 'Create Projects', category: 'Projects', description: 'Create new projects' },
    { code: 'projects:edit', name: 'Edit Projects', category: 'Projects', description: 'Edit existing projects' },
    { code: 'projects:delete', name: 'Delete Projects', category: 'Projects', description: 'Delete projects' },

    // Tasks
    { code: 'tasks:view', name: 'View Tasks', category: 'Tasks', description: 'View task list and details' },
    { code: 'tasks:create', name: 'Create Tasks', category: 'Tasks', description: 'Create new tasks' },
    { code: 'tasks:edit', name: 'Edit Tasks', category: 'Tasks', description: 'Edit existing tasks' },
    { code: 'tasks:delete', name: 'Delete Tasks', category: 'Tasks', description: 'Delete tasks' },

    // Clients
    { code: 'clients:view', name: 'View Clients', category: 'Clients', description: 'View client list and details' },
    { code: 'clients:manage', name: 'Manage Clients', category: 'Clients', description: 'Create, edit, delete clients' },

    // Team
    { code: 'team:view', name: 'View Team', category: 'Team', description: 'View team members' },
    { code: 'team:manage', name: 'Manage Team', category: 'Team', description: 'Add, edit, remove team members' },

    // Finance
    { code: 'finance:view', name: 'View Finances', category: 'Finance', description: 'View financial data and reports' },
    { code: 'finance:manage', name: 'Manage Finances', category: 'Finance', description: 'Create invoices, manage payments' },

    // Pipeline
    { code: 'pipeline:view', name: 'View Pipeline', category: 'Pipeline', description: 'View sales pipeline' },
    { code: 'pipeline:manage', name: 'Manage Pipeline', category: 'Pipeline', description: 'Manage leads and opportunities' },

    // Communication
    { code: 'messages:access', name: 'Access Messages', category: 'Communication', description: 'Access chat and messages' },
    { code: 'email:access', name: 'Access Email', category: 'Communication', description: 'Access email integration' },

    // Resources
    { code: 'files:access', name: 'Access Files', category: 'Resources', description: 'Access file storage and Drive' },
    { code: 'assets:access', name: 'Access Assets', category: 'Resources', description: 'Access digital assets library' },

    // AI Tools
    { code: 'iris:access', name: 'Access Iris AI', category: 'AI Tools', description: 'Use Iris AI assistant' },
    { code: 'oracle:access', name: 'Access Oracle', category: 'AI Tools', description: 'Use Oracle admin tool (restricted)' },

    // Support
    { code: 'tickets:view', name: 'View Tickets', category: 'Support', description: 'View support tickets' },
    { code: 'tickets:manage', name: 'Manage Tickets', category: 'Support', description: 'Create, assign, resolve tickets' },

    // Settings
    { code: 'settings:view', name: 'View Settings', category: 'Settings', description: 'View system settings' },
    { code: 'settings:manage', name: 'Manage Settings', category: 'Settings', description: 'Modify system settings' },

    // Roles (meta permission)
    { code: 'roles:manage', name: 'Manage Roles', category: 'Administration', description: 'Create and manage worker roles' },

    // CMS
    { code: 'cms:view', name: 'View CMS', category: 'CMS', description: 'View CMS content' },
    { code: 'cms:create', name: 'Create Content', category: 'CMS', description: 'Create new content' },
    { code: 'cms:edit', name: 'Edit Content', category: 'CMS', description: 'Edit existing content' },
    { code: 'cms:delete', name: 'Delete Content', category: 'CMS', description: 'Delete content' },
    { code: 'cms:publish', name: 'Publish Content', category: 'CMS', description: 'Publish/unpublish content' },
];

@Injectable()
export class PermissionsService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        await this.seedPermissions();
    }

    async seedPermissions() {
        console.log('🔐 Seeding permissions...');

        for (const perm of SYSTEM_PERMISSIONS) {
            await this.prisma.permission.upsert({
                where: { code: perm.code },
                update: { name: perm.name, description: perm.description, category: perm.category },
                create: perm,
            });
        }

        console.log(`✅ ${SYSTEM_PERMISSIONS.length} permissions seeded`);
    }

    async findAll() {
        return this.prisma.permission.findMany({
            orderBy: [{ category: 'asc' }, { code: 'asc' }],
        });
    }

    async findByCategory() {
        const permissions = await this.findAll();

        // Group by category
        const grouped: Record<string, typeof permissions> = {};
        for (const perm of permissions) {
            if (!grouped[perm.category]) {
                grouped[perm.category] = [];
            }
            grouped[perm.category].push(perm);
        }

        return grouped;
    }

    async findByCodes(codes: string[]) {
        return this.prisma.permission.findMany({
            where: { code: { in: codes } },
        });
    }

    async getUserPermissions(userId: string): Promise<string[]> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                workerRole: {
                    include: {
                        permissions: {
                            include: { permission: true },
                        },
                    },
                },
            },
        });

        if (!user) return [];

        // SUPER_ADMIN and ADMIN have all permissions
        if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
            return SYSTEM_PERMISSIONS.map(p => p.code);
        }

        // CLIENT has minimal permissions
        if (user.role === 'CLIENT') {
            return ['dashboard:view', 'projects:view', 'tasks:view', 'messages:access', 'files:access'];
        }

        // WORKER gets permissions from their workerRole
        if (user.workerRole) {
            return user.workerRole.permissions.map(rp => rp.permission.code);
        }

        // Default worker permissions if no role assigned
        return ['dashboard:view', 'projects:view', 'tasks:view'];
    }

    async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
        const permissions = await this.getUserPermissions(userId);
        return permissions.includes(permissionCode);
    }

    async hasAnyPermission(userId: string, permissionCodes: string[]): Promise<boolean> {
        const permissions = await this.getUserPermissions(userId);
        return permissionCodes.some(code => permissions.includes(code));
    }
}
