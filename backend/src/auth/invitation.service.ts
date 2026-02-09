import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as crypto from 'crypto';

/**
 * Invitation Service for user onboarding
 * 
 * Handles creating, validating, and accepting invitations.
 * Integrates with email service for sending invitation emails.
 */

@Injectable()
export class InvitationService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create a new invitation and optionally send email
     */
    async createInvitation(
        senderId: string,
        email: string,
        role: UserRole,
        driveFolderIds: string[] = [],
    ) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new BadRequestException('User already exists with this email');
        }

        // Check for existing pending invitation
        const existingInvite = await this.prisma.invitation.findFirst({
            where: { email, status: 'PENDING' },
        });
        if (existingInvite) {
            throw new BadRequestException('Pending invitation already exists for this email');
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const invitation = await this.prisma.invitation.create({
            data: {
                email,
                role,
                token,
                status: 'PENDING',
                driveFolderIds,
                expiresAt,
                invitedById: senderId,
            },
            include: {
                invitedBy: { select: { name: true, email: true } },
            },
        });

        const joinLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join?token=${token}`;

        return {
            invitation,
            link: joinLink,
        };
    }

    /**
     * Get invitation by token
     */
    async getByToken(token: string) {
        const invite = await this.prisma.invitation.findUnique({
            where: { token },
            include: {
                invitedBy: { select: { name: true, email: true } },
            },
        });

        if (!invite) return null;
        if (invite.status !== 'PENDING') return null;
        if (invite.expiresAt && invite.expiresAt < new Date()) {
            // Mark as expired
            await this.prisma.invitation.update({
                where: { id: invite.id },
                data: { status: 'EXPIRED' },
            });
            return null;
        }

        // Fetch the user to get their name (since it was set during invite creation)
        const user = await this.prisma.user.findUnique({
            where: { email: invite.email },
            select: { name: true, avatar: true }
        });

        return {
            ...invite,
            name: user?.name || 'User',
            avatar: user?.avatar
        };
    }

    /**
     * Accept an invitation and mark it as used
     */
    async acceptInvitation(token: string) {
        const invite = await this.getByToken(token);
        if (!invite) {
            throw new BadRequestException('Invalid or expired invitation');
        }

        await this.prisma.invitation.update({
            where: { id: invite.id },
            data: { status: 'ACCEPTED', acceptedAt: new Date() },
        });

        return invite;
    }

    /**
     * Get all pending invitations
     */
    async getPendingInvitations() {
        return this.prisma.invitation.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
            include: {
                invitedBy: { select: { name: true, email: true } },
            },
        });
    }

    /**
     * Revoke an invitation
     */
    async revokeInvitation(id: string) {
        const invite = await this.prisma.invitation.findUnique({ where: { id } });
        if (!invite) throw new NotFoundException('Invitation not found');

        return this.prisma.invitation.update({
            where: { id },
            data: { status: 'REVOKED' },
        });
    }

    /**
     * Delete an invitation
     */
    async deleteInvitation(id: string) {
        return this.prisma.invitation.delete({ where: { id } });
    }

    /**
     * Resend invitation (regenerate token and expiry)
     */
    async resendInvitation(id: string) {
        const invite = await this.prisma.invitation.findUnique({ where: { id } });
        if (!invite) throw new NotFoundException('Invitation not found');

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const updated = await this.prisma.invitation.update({
            where: { id },
            data: {
                token,
                expiresAt,
                status: 'PENDING'
            },
        });

        const joinLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join?token=${token}`;

        return { invitation: updated, link: joinLink };
    }
}
