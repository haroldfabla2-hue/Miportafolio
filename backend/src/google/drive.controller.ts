import { Controller, Get, Post, Delete, Body, Query, Req, UseGuards, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { GoogleService } from './google.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';

@Controller('google/drive')
@UseGuards(JwtAuthGuard)
export class DriveController {
    constructor(private readonly googleService: GoogleService) { }

    @Get('files')
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
    async deleteFile(@Req() req, @Param('id') id: string) {
        const drive = await this.googleService.getDriveClient(req.user.id);
        await drive.files.delete({ fileId: id });
        return { success: true };
    }
}
