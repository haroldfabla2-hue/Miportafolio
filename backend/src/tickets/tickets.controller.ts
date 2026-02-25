import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Get()
    @RequiresPermission('tickets:view')
    findAll(@Req() req: any) {
        return this.ticketsService.findAll(req.user);
    }

    @Get('stats')
    @RequiresPermission('tickets:view')
    getStats(@Req() req: any) {
        return this.ticketsService.getStats(req.user);
    }

    @Get(':id')
    @RequiresPermission('tickets:view')
    findOne(@Param('id') id: string, @Req() req: any) {
        return this.ticketsService.findOne(id, req.user);
    }

    @Post()
    @RequiresPermission('tickets:manage')
    create(@Body() data: any, @Req() req: any) {
        return this.ticketsService.create(data, req.user.id);
    }

    @Put(':id')
    @RequiresPermission('tickets:manage')
    update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
        return this.ticketsService.update(id, data, req.user);
    }

    @Put(':id/status')
    @RequiresPermission('tickets:manage')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Req() req: any) {
        return this.ticketsService.updateStatus(id, body.status, req.user);
    }

    @Put(':id/assign')
    @RequiresPermission('tickets:manage')
    assignTo(@Param('id') id: string, @Body() body: { assignedToId: string }, @Req() req: any) {
        return this.ticketsService.assignTo(id, body.assignedToId, req.user);
    }

    @Delete(':id')
    @RequiresPermission('tickets:manage')
    delete(@Param('id') id: string, @Req() req: any) {
        return this.ticketsService.delete(id, req.user);
    }
}
