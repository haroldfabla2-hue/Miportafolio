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
        if (folderId) {
            query += ` and '${folderId}' in parents`;
        }
        if (q) {
            query += ` and name contains '${q}'`;
        }

        const response = await drive.files.list({
            q: query,
            fields: 'nextPageToken, files(id, name, mimeType, iconLink, webViewLink, parents, modifiedTime)',
            orderBy: 'folder,modifiedTime desc'
        });
        return response.data;
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
