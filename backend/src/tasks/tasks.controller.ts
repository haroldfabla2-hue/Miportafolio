import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get()
    @RequiresPermission('tasks:view')
    async findAll(@Req() req: any, @Query('projectId') projectId?: string) {
        try {
            const user = req.user;
            if (projectId) {
                return await this.tasksService.findByProject(projectId, user);
            }
            return await this.tasksService.findAll(user);
        } catch (error) {
            console.error('Error in TasksController.findAll:', error);
            throw error;
        }
    }

    @Get('stats')
    @RequiresPermission('tasks:view')
    getStats(@Req() req: any) {
        return this.tasksService.getTaskStats(req.user);
    }

    @Get(':id')
    @RequiresPermission('tasks:view')
    findOne(@Param('id') id: string, @Req() req: any) {
        return this.tasksService.findOne(id, req.user);
    }

    @Post()
    @RequiresPermission('tasks:create')
    create(@Body() data: any, @Req() req: any) {
        return this.tasksService.create(data, req.user);
    }

    @Put(':id')
    @RequiresPermission('tasks:edit')
    update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
        return this.tasksService.update(id, data, req.user);
    }

    @Put(':id/status')
    @RequiresPermission('tasks:edit')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Req() req: any) {
        return this.tasksService.updateStatus(id, body.status, req.user);
    }

    @Delete(':id')
    @RequiresPermission('tasks:delete')
    remove(@Param('id') id: string, @Req() req: any) {
        return this.tasksService.remove(id, req.user);
    }
}
