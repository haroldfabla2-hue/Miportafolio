import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
    constructor(private readonly cmsService: CmsService) { }

    // --- PUBLIC ROUTES (No auth required) ---

    @Get('portfolio')
    @Public()
    getPortfolio() {
        return this.cmsService.getPortfolio();
    }

    @Get('blog')
    @Public()
    getBlogs() {
        return this.cmsService.getBlogs();
    }

    @Get('content/:slug')
    @Public()
    getBySlug(@Param('slug') slug: string) {
        return this.cmsService.getBySlug(slug);
    }

    // --- ADMIN ROUTES (Protected with permissions) ---

    @Get('admin/all')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @RequiresPermission('cms:view')
    findAllAdmin(
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.cmsService.findAllWithFilters({
            type,
            status,
            search,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
    }

    @Get('admin/:id')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @RequiresPermission('cms:view')
    findOneAdmin(@Param('id') id: string) {
        return this.cmsService.findOne(id);
    }

    @Post('admin')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @RequiresPermission('cms:create')
    createContent(@Body() data: any) {
        return this.cmsService.create(data);
    }

    @Patch('admin/:id')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @RequiresPermission('cms:edit')
    updateContent(@Param('id') id: string, @Body() data: any) {
        return this.cmsService.update(id, data);
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @RequiresPermission('cms:delete')
    deleteContent(@Param('id') id: string) {
        return this.cmsService.delete(id);
    }

    @Patch('admin/:id/publish')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @RequiresPermission('cms:publish')
    togglePublish(@Param('id') id: string, @Body() body: { publish: boolean }) {
        return this.cmsService.togglePublish(id, body.publish);
    }
}
