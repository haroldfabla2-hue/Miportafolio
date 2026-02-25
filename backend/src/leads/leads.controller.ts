import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadStatus } from '@prisma/client';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

    // --- PUBLIC ENDPOINT (Website Contact Form) ---
    @Post('contact')
    @Public()
    async createFromWebsite(@Body() data: { name: string; email: string; message: string; company?: string }) {
        return this.leadsService.create({
            name: data.name,
            email: data.email,
            notes: data.message,
            company: data.company || '',
            source: 'WEBSITE',
            status: 'NEW',
        });
    }

    // --- PROTECTED ENDPOINTS ---

    @Get()
    @RequiresPermission('pipeline:view')
    findAll(@Req() req: any, @Query('status') status?: string) {
        if (status) {
            return this.leadsService.findByStatus(status as LeadStatus, req.user);
        }
        return this.leadsService.findAll(req.user);
    }

    @Get('stats')
    @RequiresPermission('pipeline:view')
    getStats(@Req() req: any) {
        return this.leadsService.getStats(req.user);
    }

    @Get(':id')
    @RequiresPermission('pipeline:view')
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.leadsService.findOne(id, req.user);
    }

    @Post()
    @RequiresPermission('pipeline:manage')
    create(@Body() data: any) {
        return this.leadsService.create(data);
    }

    @Put(':id')
    @RequiresPermission('pipeline:manage')
    update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
        return this.leadsService.update(id, data, req.user);
    }

    @Put(':id/status')
    @RequiresPermission('pipeline:manage')
    updateStatus(@Req() req: any, @Param('id') id: string, @Body() body: { status: string }) {
        return this.leadsService.updateStatus(id, body.status, req.user);
    }

    @Delete(':id')
    @RequiresPermission('pipeline:manage')
    delete(@Req() req: any, @Param('id') id: string) {
        return this.leadsService.delete(id, req.user);
    }
}
