import { Controller, Get, Post, Put, Delete, Body, Query, UseGuards, Param, Req } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Get()
    async findAll(@Query() query: any) {
        return this.eventsService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Post()
    async create(@Body() data: any, @Req() req: any) {
        return this.eventsService.create(data, req.user.id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any) {
        return this.eventsService.update(id, data);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.eventsService.delete(id);
    }
}
