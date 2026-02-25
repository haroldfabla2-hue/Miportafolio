import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post()
    @RequiresPermission('assets:access')
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
    @RequiresPermission('assets:access')
    findAll(
        @Request() req: any,
        @Query('projectId') projectId?: string,
        @Query('type') type?: string,
        @Query('status') status?: string
    ) {
        return this.assetsService.findAll(req.user, { projectId, type, status });
    }

    @Get(':id')
    @RequiresPermission('assets:access')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.assetsService.findOne(id, req.user);
    }

    @Patch(':id')
    @RequiresPermission('assets:access')
    update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
        return this.assetsService.update(id, body, req.user);
    }

    @Delete(':id')
    @RequiresPermission('assets:access')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.assetsService.remove(id, req.user);
    }
}
