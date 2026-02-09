import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get()
    async findAll(@Req() req: any, @Query('projectId') projectId?: string) {
        try {
            const user = req.user;
            if (projectId) {
                return await this.tasksService.findByProject(projectId);
            }
            return await this.tasksService.findAll(user);
        } catch (error) {
            console.error('Error in TasksController.findAll:', error);
            throw error;
        }
    }

    @Get('stats')
    getStats(@Req() req: any) {
        return this.tasksService.getTaskStats(req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Post()
    create(@Body() data: any) {
        return this.tasksService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.tasksService.update(id, data);
    }

    @Put(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.tasksService.updateStatus(id, body.status);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tasksService.remove(id);
    }
}
