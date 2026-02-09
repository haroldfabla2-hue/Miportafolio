import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Get()
    findAll(@Req() req: any) {
        const user = req.user || { role: 'ADMIN', id: 'mock-admin-id' };
        return this.ticketsService.findAll(user);
    }

    @Get('stats')
    getStats() {
        return this.ticketsService.getStats();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ticketsService.findOne(id);
    }

    @Post()
    create(@Body() data: any, @Req() req: any) {
        const userId = req.user?.id || 'mock-user-id';
        return this.ticketsService.create(data, userId);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.ticketsService.update(id, data);
    }

    @Put(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.ticketsService.updateStatus(id, body.status);
    }

    @Put(':id/assign')
    assignTo(@Param('id') id: string, @Body() body: { assignedToId: string }) {
        return this.ticketsService.assignTo(id, body.assignedToId);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.ticketsService.delete(id);
    }
}
