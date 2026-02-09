import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleDriveService } from '../google/google-drive.service';

@Injectable()
export class AssetsService {
    constructor(
        private prisma: PrismaService,
        private googleDrive: GoogleDriveService
    ) { }

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

    async findAll(filters: { projectId?: string; type?: string; status?: string }) {
        const where: any = {};
        if (filters.projectId) where.projectId = filters.projectId;
        if (filters.type && filters.type !== 'all') where.type = filters.type;
        if (filters.status && filters.status !== 'all') where.status = filters.status;

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

    async findOne(id: string) {
        const asset = await this.prisma.asset.findUnique({
            where: { id },
            include: { project: true }
        });
        if (!asset) throw new NotFoundException('Asset not found');
        return asset;
    }

    async update(id: string, data: any) {
        return this.prisma.asset.update({
            where: { id },
            data
        });
    }

    async remove(id: string, userId: string) {
        const asset = await this.findOne(id);

        // Delete from Drive if linked
        if (asset.driveId) {
            try {
                await this.googleDrive.deleteFile(userId, asset.driveId);
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
