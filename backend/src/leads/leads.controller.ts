import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadStatus } from '@prisma/client';
import { Public } from '../auth/public.decorator';

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
    findAll(@Query('status') status?: string) {
        if (status) {
            return this.leadsService.findByStatus(status as LeadStatus);
        }
        return this.leadsService.findAll();
    }

    @Get('stats')
    getStats() {
        return this.leadsService.getStats();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.leadsService.findOne(id);
    }

    @Post()
    create(@Body() data: any) {
        return this.leadsService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.leadsService.update(id, data);
    }

    @Put(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.leadsService.updateStatus(id, body.status);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.leadsService.delete(id);
    }
}
