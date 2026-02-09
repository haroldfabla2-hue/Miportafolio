import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadStatus } from '@prisma/client';

@Controller('leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

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
