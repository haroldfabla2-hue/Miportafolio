import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    create(
        @Request() req: any,
        @UploadedFile() file: any,
        @Body() body: any
    ) {
        const userId = req.user.id;
        return this.assetsService.create(body, userId, file);
    }

    @Get()
    findAll(
        @Query('projectId') projectId?: string,
        @Query('type') type?: string,
        @Query('status') status?: string
    ) {
        return this.assetsService.findAll({ projectId, type, status });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.assetsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.assetsService.update(id, body);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        const userId = req.user.id;
        return this.assetsService.remove(id, userId);
    }
}
