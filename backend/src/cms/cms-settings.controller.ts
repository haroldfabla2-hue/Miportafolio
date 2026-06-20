import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';
import { CmsSettingsService } from './cms-settings.service';

@Controller('cms-settings')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CmsSettingsController {
    constructor(private readonly settingsService: CmsSettingsService) { }

    // --- SETTINGS ---

    @Get()
    @RequiresPermission('cms:view')
    getSettings() {
        return this.settingsService.getSettings();
    }

    @Put('seo')
    @RequiresPermission('cms:edit')
    updateSeo(@Body() data: any) {
        return this.settingsService.updateSeo(data);
    }

    @Put('media')
    @RequiresPermission('cms:edit')
    updateMedia(@Body() data: any) {
        return this.settingsService.updateMedia(data);
    }

    @Put('publishing')
    @RequiresPermission('cms:edit')
    updatePublishing(@Body() data: any) {
        return this.settingsService.updatePublishing(data);
    }

    @Put('general')
    @RequiresPermission('cms:edit')
    updateGeneral(@Body() body: { siteName: string; siteUrl: string }) {
        return this.settingsService.updateGeneral(body.siteName, body.siteUrl);
    }

    // --- TAXONOMIES ---

    @Get('taxonomies')
    @RequiresPermission('cms:view')
    getTaxonomies() {
        return this.settingsService.getTaxonomies();
    }

    @Post('taxonomies')
    @RequiresPermission('cms:edit')
    createTaxonomy(@Body() data: any) {
        return this.settingsService.createTaxonomy(data);
    }

    @Put('taxonomies/:id')
    @RequiresPermission('cms:edit')
    updateTaxonomy(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
        return this.settingsService.updateTaxonomy(id, data);
    }

    @Delete('taxonomies/:id')
    @RequiresPermission('cms:edit')
    deleteTaxonomy(@Param('id', ParseIntPipe) id: number) {
        return this.settingsService.deleteTaxonomy(id);
    }

    // --- TAXONOMY TERMS ---

    @Post('taxonomies/:id/terms')
    @RequiresPermission('cms:edit')
    createTerm(@Param('id', ParseIntPipe) taxonomyId: number, @Body() data: any) {
        return this.settingsService.createTerm(taxonomyId, data);
    }

    @Put('terms/:id')
    @RequiresPermission('cms:edit')
    updateTerm(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
        return this.settingsService.updateTerm(id, data);
    }

    @Delete('terms/:id')
    @RequiresPermission('cms:edit')
    deleteTerm(@Param('id', ParseIntPipe) id: number) {
        return this.settingsService.deleteTerm(id);
    }

    // --- CUSTOM FIELD DEFINITIONS ---

    @Get('custom-fields')
    @RequiresPermission('cms:view')
    getCustomFields(@Query('contentType') contentType?: string) {
        return this.settingsService.getCustomFields(contentType);
    }

    @Post('custom-fields')
    @RequiresPermission('cms:edit')
    createCustomField(@Body() data: any) {
        return this.settingsService.createCustomField(data);
    }

    @Put('custom-fields/:id')
    @RequiresPermission('cms:edit')
    updateCustomField(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
        return this.settingsService.updateCustomField(id, data);
    }

    @Delete('custom-fields/:id')
    @RequiresPermission('cms:edit')
    deleteCustomField(@Param('id', ParseIntPipe) id: number) {
        return this.settingsService.deleteCustomField(id);
    }

    // --- PUBLISHING WEBHOOKS ---

    @Get('webhooks')
    @RequiresPermission('cms:view')
    getWebhooks() {
        return this.settingsService.getWebhooks();
    }

    @Post('webhooks')
    @RequiresPermission('cms:edit')
    createWebhook(@Body() data: any) {
        return this.settingsService.createWebhook(data);
    }

    @Put('webhooks/:id')
    @RequiresPermission('cms:edit')
    updateWebhook(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
        return this.settingsService.updateWebhook(id, data);
    }

    @Delete('webhooks/:id')
    @RequiresPermission('cms:edit')
    deleteWebhook(@Param('id', ParseIntPipe) id: number) {
        return this.settingsService.deleteWebhook(id);
    }
}
