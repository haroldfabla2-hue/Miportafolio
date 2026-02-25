import { Injectable, NotFoundException, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GmailService } from '../google/gmail.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private gmailService: GmailService
    ) { }

    private isAdmin(user?: any): boolean {
        return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
    }

    private readonly safeUserSelect = {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        hourlyRate: true,
        reputationScore: true,
        createdAt: true,
        googleConnected: true,
        googleScopes: true,
        googleTokenExpiry: true,
        assignedDriveFolderId: true,
        assignedDriveFolderName: true,
        twoFactorEnabled: true,
        onboardingCompleted: true,
        phone: true,
        jobTitle: true,
        profileDetails: true,
    } as const;

    private readonly internalUserSelect = {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        hourlyRate: true,
        reputationScore: true,
        createdAt: true,
        googleConnected: true,
        googleRefreshToken: true,
        googleAccessToken: true,
        googleScopes: true,
        googleTokenExpiry: true,
        assignedDriveFolderId: true,
        assignedDriveFolderName: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        onboardingCompleted: true,
        phone: true,
        jobTitle: true,
        profileDetails: true,
    } as const;

    async findAll(user: any) {
        // Role-based filtering
        if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
            return this.prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    avatar: true,
                    hourlyRate: true,
                    reputationScore: true,
                    createdAt: true,
                    updatedAt: true,
                    googleConnected: true,
                    assignedDriveFolderId: true,
                    assignedDriveFolderName: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        // Workers only see admins and clients
        if (user.role === 'WORKER') {
            return this.prisma.user.findMany({
                where: { role: { in: ['CLIENT', 'ADMIN'] } },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    avatar: true,
                },
            });
        }
        return [];
    }

    async findOne(email: string) {
        const normalizedEmail = email?.trim().toLowerCase();
        if (!normalizedEmail) return null;

        return this.prisma.user.findFirst({
            where: {
                email: {
                    equals: normalizedEmail,
                    mode: 'insensitive',
                },
            },
        });
    }

    async findById(id: string, viewer?: any) {
        if (viewer && !this.isAdmin(viewer) && viewer.id !== id) {
            throw new ForbiddenException('You can only access your own user profile');
        }

        const user = await this.prisma.user.findUnique({
            where: { id },
            select: this.safeUserSelect,
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async findByIdInternal(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: this.internalUserSelect,
        });

        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async create(data: any) {
        const normalizedEmail = data.email?.trim().toLowerCase();
        const existing = await this.findOne(normalizedEmail);
        if (existing) throw new ConflictException('Email already exists');

        const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;

        return this.prisma.user.create({
            data: {
                email: normalizedEmail,
                name: data.name,
                password: hashedPassword,
                role: data.role || 'CLIENT',
                avatar: data.avatar,
                hourlyRate: data.hourlyRate,
                assignedDriveFolderId: data.assignedDriveFolderId,
                assignedDriveFolderName: data.assignedDriveFolderName,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                createdAt: true,
                assignedDriveFolderId: true,
                assignedDriveFolderName: true,
                onboardingCompleted: true,
                phone: true,
                jobTitle: true,
                profileDetails: true,
            },
        });
    }

    async update(id: string, data: any, actor?: any) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        if (actor && !this.isAdmin(actor) && actor.id !== id) {
            throw new ForbiddenException('You can only update your own profile');
        }

        const canManageRoles = actor ? this.isAdmin(actor) : true;
        const canManageSensitive = actor ? this.isAdmin(actor) : true;

        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.role !== undefined && canManageRoles) updateData.role = data.role;
        if (data.avatar !== undefined) updateData.avatar = data.avatar;
        if (data.hourlyRate !== undefined && canManageSensitive) updateData.hourlyRate = data.hourlyRate;
        if (data.password !== undefined) {
            updateData.password = data.password ? await bcrypt.hash(data.password, 10) : null;
        }
        if (data.monthlySalary !== undefined && canManageSensitive) updateData.monthlySalary = data.monthlySalary;
        if (data.reputationScore !== undefined && canManageSensitive) updateData.reputationScore = data.reputationScore;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
        if (data.profileDetails !== undefined) updateData.profileDetails = data.profileDetails;
        if (data.workerRoleId !== undefined && canManageRoles) updateData.workerRoleId = data.workerRoleId;

        // Google integration fields
        if (data.googleAccessToken !== undefined) updateData.googleAccessToken = data.googleAccessToken;
        if (data.googleRefreshToken !== undefined) updateData.googleRefreshToken = data.googleRefreshToken;
        if (data.googleTokenExpiry !== undefined) {
            updateData.googleTokenExpiry = data.googleTokenExpiry ? new Date(data.googleTokenExpiry) : null;
        }
        if (data.googleConnected !== undefined) updateData.googleConnected = data.googleConnected;
        if (data.googleScopes !== undefined) updateData.googleScopes = Array.isArray(data.googleScopes) ? data.googleScopes : [];

        if (data.onboardingCompleted !== undefined) updateData.onboardingCompleted = data.onboardingCompleted;

        if (data.assignedDriveFolderId !== undefined) updateData.assignedDriveFolderId = data.assignedDriveFolderId;
        if (data.assignedDriveFolderName !== undefined) updateData.assignedDriveFolderName = data.assignedDriveFolderName;
        if (data.twoFactorEnabled !== undefined) updateData.twoFactorEnabled = data.twoFactorEnabled;
        if (data.twoFactorSecret !== undefined) updateData.twoFactorSecret = data.twoFactorSecret;

        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                hourlyRate: true,
                updatedAt: true,
                googleConnected: true,
                assignedDriveFolderId: true,
                assignedDriveFolderName: true,
                onboardingCompleted: true,
                phone: true,
                jobTitle: true,
                profileDetails: true,
            },
        });
    }

    async remove(id: string, actor?: any) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        if (actor && !this.isAdmin(actor) && actor.id !== id) {
            throw new ForbiddenException('You can only remove your own user');
        }

        return this.prisma.user.delete({ where: { id } });
    }

    async getStats(user?: any) {
        if (!user || this.isAdmin(user)) {
            const [total, admins, workers, clients] = await Promise.all([
                this.prisma.user.count(),
                this.prisma.user.count({ where: { role: 'ADMIN' } }),
                this.prisma.user.count({ where: { role: 'WORKER' } }),
                this.prisma.user.count({ where: { role: 'CLIENT' } }),
            ]);

            return {
                total,
                byRole: {
                    admins,
                    workers,
                    clients
                }
            };
        }

        const visibleUsers = await this.findAll(user);
        const byRole = visibleUsers.reduce((acc: Record<string, number>, u: any) => {
            acc[u.role] = (acc[u.role] || 0) + 1;
            return acc;
        }, {});

        return {
            total: visibleUsers.length,
            byRole: {
                admins: byRole.ADMIN || 0,
                workers: byRole.WORKER || 0,
                clients: byRole.CLIENT || 0,
            },
        };
    }

    async inviteUser(inviterId: string, data: { name: string; email: string; role?: string }) {
        // 1. Verify Inviter has Google Integration
        const isConnected = await this.gmailService.isGmailConnected(inviterId);
        if (!isConnected) {
            throw new UnauthorizedException('You must connect your Google account in Settings to send invitations.');
        }

        // 2. Check if user already exists
        const normalizedEmail = data.email?.trim().toLowerCase();
        const existing = await this.findOne(normalizedEmail);
        if (existing) {
            throw new ConflictException('User with this email already exists.');
        }

        // 3. Create User (Pending)
        // Check if role is valid enum, otherwise default to CLIENT
        const role = ['CLIENT', 'WORKER', 'ADMIN'].includes(data.role || '') ? data.role : 'CLIENT';

        const user = await this.prisma.user.create({
            data: {
                email: normalizedEmail,
                name: data.name,
                role: role as any,
                password: null, // No password initially
            }
        });

        // 4. Create Invitation Token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        await this.prisma.invitation.create({
            data: {
                email: normalizedEmail,
                token,
                role: role as any,
                expiresAt,
                invitedById: inviterId,
                status: 'PENDING'
            }
        });

        // 5. Send Email via Gmail API
        // Use generic frontend URL logic
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const inviteLink = `${frontendUrl}/invite/${token}`;

        await this.gmailService.sendEmail(inviterId, {
            to: data.email,
            subject: 'Invitation to Join Silhouette CRM',
            isHtml: true,
            body: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1; margin-bottom: 20px;">Hello ${data.name},</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #333;">You have been invited to join <strong>Silhouette CRM</strong>.</p>
                    <p style="font-size: 16px; line-height: 1.5; color: #333;">Please click the button below to accept the invitation and set your password:</p>
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${inviteLink}" style="display: inline-block; padding: 14px 28px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Accept Invitation</a>
                    </div>
                    <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">Or copy this link if the button doesn't work:</p>
                    <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 13px; color: #666;">${inviteLink}</p>
                    <p style="color: #999; font-size: 12px; margin-top: 10px;">This invitation expires in 7 days.</p>
                </div>
            `
        });

        return { success: true, message: 'Invitation sent via your Gmail account', userId: user.id };
    }

    async completeOnboarding(userId: string, data?: { phone?: string; jobTitle?: string; profileDetails?: any }) {
        const updateData: any = { onboardingCompleted: true };

        if (data) {
            if (data.phone) updateData.phone = data.phone;
            if (data.jobTitle) updateData.jobTitle = data.jobTitle;
            if (data.profileDetails) updateData.profileDetails = data.profileDetails;
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, onboardingCompleted: true, phone: true, jobTitle: true }
        });
    }
}
