import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleDriveService } from '../google/google-drive.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssetsService {
    constructor(
        private prisma: PrismaService,
        private googleDrive: GoogleDriveService
    ) { }

    private buildWhereClause(
        user: any,
        filters: { projectId?: string; type?: string; status?: string }
    ): Prisma.AssetWhereInput {
        const baseWhere: Prisma.AssetWhereInput = {};

        if (filters.projectId) baseWhere.projectId = filters.projectId;
        if (filters.type && filters.type !== 'all') baseWhere.type = filters.type;
        if (filters.status && filters.status !== 'all') baseWhere.status = filters.status;

        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            return baseWhere;
        }

        const visibilityScope: Prisma.AssetWhereInput =
            user.role === 'WORKER'
                ? {
                    OR: [
                        { uploadedBy: user.id },
                        { project: { managerId: user.id } },
                        { project: { team: { some: { id: user.id } } } },
                    ],
                }
                : user.role === 'CLIENT'
                    ? {
                        OR: [
                            { uploadedBy: user.id },
                            { project: { client: { email: user.email } } },
                        ],
                    }
                    : { id: '__forbidden__' };

        return {
            AND: [
                baseWhere,
                visibilityScope,
            ],
        };
    }

    async create(data: any, userId: string, file?: any) {
        // 1. Upload to Google Drive if file is present
        let driveData = null;
        if (file) {
            // Buffer is passed from controller (using an interceptor or raw body)
            // Assuming file structure { originalname, buffer, mimetype }
            driveData = await this.googleDrive.uploadFile(
                userId,
                file.originalname,
                file.mimetype,
                file.buffer
            );
        }

        // 2. Create Asset in DB
        return this.prisma.asset.create({
            data: {
                name: data.name || file?.originalname || 'Untitled Asset',
                type: data.type || this.deriveType(file?.mimetype),
                url: driveData?.webViewLink || data.url || '#',
                driveId: driveData?.id,
                thumbnailUrl: driveData?.thumbnailLink,
                status: 'DRAFT',
                uploadedBy: userId,
                projectId: data.projectId,
            }
        });
    }

    async findAll(user: any, filters: { projectId?: string; type?: string; status?: string }) {
        const where = this.buildWhereClause(user, filters);
        return this.prisma.asset.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                project: {
                    select: { id: true, name: true }
                }
            }
        });
    }

    async findOne(id: string, user: any) {
        const where = this.buildWhereClause(user, {});
        const asset = await this.prisma.asset.findFirst({
            where: {
                AND: [
                    { id },
                    where,
                ],
            },
            include: { project: true }
        });
        if (!asset) throw new NotFoundException('Asset not found');
        return asset;
    }

    async update(id: string, data: any, user: any) {
        await this.findOne(id, user);
        return this.prisma.asset.update({
            where: { id },
            data
        });
    }

    async remove(id: string, user: any) {
        const asset = await this.findOne(id, user);

        // Delete from Drive if linked
        if (asset.driveId) {
            try {
                await this.googleDrive.deleteFile(user.id, asset.driveId);
            } catch (e) {
                console.error(`Failed to delete file from Drive: ${asset.driveId}`, e);
            }
        }

        return this.prisma.asset.delete({
            where: { id }
        });
    }

    private deriveType(mimeType?: string): string {
        if (!mimeType) return 'other';
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
        return 'other';
    }
}
