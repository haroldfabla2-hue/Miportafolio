import { Controller, Get, Post, Delete, Body, Query, Req, UseGuards, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { GoogleService } from './google.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';
import { Public } from '../auth/public.decorator';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Controller('google/drive')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class DriveController {
    constructor(
        private readonly googleService: GoogleService,
        private readonly configService: ConfigService
    ) { }

    @Post('webhook')
    @Public()
    async handleDriveWebhook(@Req() req) {
        // Validación HMAC de Webhooks de Google
        const channelToken = req.headers['x-goog-channel-token'];
        const channelId = req.headers['x-goog-channel-id'];
        
        if (!channelToken) {
            return { success: false, reason: 'Missing token' };
        }

        const secret = this.configService.get<string>('WEBHOOK_SECRET') || 'default_webhook_secret';
        const expectedToken = crypto.createHmac('sha256', secret).update(channelId || '').digest('hex');

        if (channelToken !== expectedToken) {
            console.error('[Drive Webhook] HMAC Validation Failed');
            return { success: false, reason: 'HMAC signature invalid' };
        }

        console.log('[Drive Webhook] HMAC validated successfully for channel:', channelId);
        // Process webhook payload here
        return { success: true };
    }

    @Get('files')
    @RequiresPermission('files:access')
    async listFiles(@Req() req, @Query('folderId') folderId?: string, @Query('q') q?: string) {
        const drive = await this.googleService.getDriveClient(req.user.id);

        let query = "trashed = false";
        if (folderId && folderId !== 'root') {
            query += ` and '${folderId}' in parents`;
        } else if (!q) {
            // If no folder and no search, default to root
            query += " and 'root' in parents";
        }

        if (q) {
            query += ` and name contains '${q}'`;
        }

        try {
            const response = await drive.files.list({
                q: query,
                fields: 'nextPageToken, files(id, name, mimeType, size, iconLink, webViewLink, parents, modifiedTime, thumbnailLink)',
                orderBy: 'folder,modifiedTime desc',
                pageSize: 100
            });

            const files = response.data.files || [];

            // Map to frontend friendly format
            return files.map(file => {
                const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                let type = 'file';
                if (isFolder) type = 'folder';
                else if (file.mimeType.includes('image')) type = 'image';
                else if (file.mimeType.includes('pdf')) type = 'pdf';
                else if (file.mimeType.includes('spreadsheet') || file.mimeType.includes('excel')) type = 'sheet';
                else if (file.mimeType.includes('document') || file.mimeType.includes('word')) type = 'doc';

                return {
                    id: file.id,
                    name: file.name,
                    type,
                    mimeType: file.mimeType,
                    size: file.size ? this.formatBytes(Number(file.size)) : '-',
                    modified: file.modifiedTime,
                    webViewLink: file.webViewLink,
                    iconLink: file.iconLink,
                    thumbnailLink: file.thumbnailLink,
                    isFolder
                };
            });
        } catch (error) {
            console.error('Drive List Error:', error);
            throw error;
        }
    }

    private formatBytes(bytes: number, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    @Post('upload')
    @RequiresPermission('files:access')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@Req() req, @UploadedFile() file: Express.Multer.File, @Body('folderId') folderId?: string) {
        const drive = await this.googleService.getDriveClient(req.user.id);

        const fileMetadata: any = {
            name: file.originalname,
        };

        if (folderId) {
            fileMetadata.parents = [folderId];
        }

        const media = {
            mimeType: file.mimetype,
            body: Readable.from(file.buffer),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink',
        });

        return response.data;
    }

    @Post('folders')
    @RequiresPermission('files:access')
    async createFolder(@Req() req, @Body() body: { name: string; parentId?: string }) {
        const drive = await this.googleService.getDriveClient(req.user.id);

        const fileMetadata: any = {
            name: body.name,
            mimeType: 'application/vnd.google-apps.folder',
        };

        if (body.parentId) {
            fileMetadata.parents = [body.parentId];
        }

        const response = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, name, webViewLink',
        });

        return response.data;
    }

    @Delete('files/:id')
    @RequiresPermission('files:access')
    async deleteFile(@Req() req, @Param('id') id: string) {
        const drive = await this.googleService.getDriveClient(req.user.id);
        await drive.files.delete({ fileId: id });
        return { success: true };
    }
}
