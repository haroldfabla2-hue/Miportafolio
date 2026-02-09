import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    modifiedTime?: string;
    webViewLink?: string;
    iconLink?: string;
    thumbnailLink?: string;
}

@Injectable()
export class GoogleDriveService {
    private oAuth2Client: OAuth2Client;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.oAuth2Client = new google.auth.OAuth2(
            this.configService.get('GOOGLE_CLIENT_ID'),
            this.configService.get('GOOGLE_CLIENT_SECRET'),
        );
    }

    /**
     * Get OAuth2 client configured with user's tokens
     */
    private async getAuthenticatedClient(userId: string): Promise<OAuth2Client> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                googleAccessToken: true,
                googleRefreshToken: true,
                googleTokenExpiry: true,
                googleConnected: true,
            },
        });

        if (!user?.googleConnected || !user.googleAccessToken) {
            throw new UnauthorizedException('User has not connected Google account');
        }

        const client = new google.auth.OAuth2(
            this.configService.get('GOOGLE_CLIENT_ID'),
            this.configService.get('GOOGLE_CLIENT_SECRET'),
        );

        client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken,
            expiry_date: user.googleTokenExpiry?.getTime(),
        });

        // Refresh token if expired
        if (user.googleTokenExpiry && new Date() > user.googleTokenExpiry) {
            const { credentials } = await client.refreshAccessToken();

            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    googleAccessToken: credentials.access_token,
                    googleTokenExpiry: credentials.expiry_date
                        ? new Date(credentials.expiry_date)
                        : null,
                },
            });

            client.setCredentials(credentials);
        }

        return client;
    }

    /**
     * List files in user's assigned Drive folder
     */
    async listFiles(userId: string, pageSize = 50): Promise<DriveFile[]> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { assignedDriveFolderId: true },
        });

        if (!user?.assignedDriveFolderId) {
            return [];
        }

        const auth = await this.getAuthenticatedClient(userId);
        const drive = google.drive({ version: 'v3', auth });

        const response = await drive.files.list({
            q: `'${user.assignedDriveFolderId}' in parents and trashed = false`,
            pageSize,
            fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink, thumbnailLink)',
            orderBy: 'modifiedTime desc',
        });

        return (response.data.files || []) as DriveFile[];
    }

    /**
     * Upload file to user's assigned Drive folder
     */
    async uploadFile(
        userId: string,
        fileName: string,
        mimeType: string,
        content: Buffer | NodeJS.ReadableStream,
    ): Promise<DriveFile> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { assignedDriveFolderId: true },
        });

        if (!user?.assignedDriveFolderId) {
            throw new Error('No Drive folder assigned to this user');
        }

        const auth = await this.getAuthenticatedClient(userId);
        const drive = google.drive({ version: 'v3', auth });

        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [user.assignedDriveFolderId],
            },
            media: {
                mimeType,
                body: content,
            },
            fields: 'id, name, mimeType, size, webViewLink',
        });

        return response.data as DriveFile;
    }

    /**
     * Delete file from Drive
     */
    async deleteFile(userId: string, fileId: string): Promise<void> {
        const auth = await this.getAuthenticatedClient(userId);
        const drive = google.drive({ version: 'v3', auth });

        await drive.files.delete({ fileId });
    }

    /**
     * Create folder in admin's Drive and share with user
     * This is called by admin when assigning a folder
     */
    async createAndAssignFolder(
        adminUserId: string,
        targetUserId: string,
        folderName: string,
        targetUserEmail: string,
    ): Promise<{ folderId: string; folderName: string }> {
        const auth = await this.getAuthenticatedClient(adminUserId);
        const drive = google.drive({ version: 'v3', auth });

        // Create folder
        const folder = await drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
            },
            fields: 'id, name',
        });

        const folderId = folder.data.id!;

        // Share folder with target user
        await drive.permissions.create({
            fileId: folderId,
            requestBody: {
                type: 'user',
                role: 'writer',
                emailAddress: targetUserEmail,
            },
            sendNotificationEmail: true,
        });

        // Update target user with assigned folder
        await this.prisma.user.update({
            where: { id: targetUserId },
            data: {
                assignedDriveFolderId: folderId,
                assignedDriveFolderName: folderName,
            },
        });

        return { folderId, folderName };
    }

    /**
     * Assign existing folder to user
     */
    async assignExistingFolder(
        targetUserId: string,
        folderId: string,
        folderName: string,
    ): Promise<void> {
        await this.prisma.user.update({
            where: { id: targetUserId },
            data: {
                assignedDriveFolderId: folderId,
                assignedDriveFolderName: folderName,
            },
        });
    }

    /**
     * Get folder info
     */
    async getFolderInfo(userId: string): Promise<{ folderId: string | null; folderName: string | null }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                assignedDriveFolderId: true,
                assignedDriveFolderName: true,
            },
        });

        return {
            folderId: user?.assignedDriveFolderId || null,
            folderName: user?.assignedDriveFolderName || null,
        };
    }
}
