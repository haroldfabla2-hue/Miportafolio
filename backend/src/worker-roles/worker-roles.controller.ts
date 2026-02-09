import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { WorkerRolesService } from './worker-roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('worker-roles')
@UseGuards(JwtAuthGuard)
export class WorkerRolesController {
    constructor(private readonly workerRolesService: WorkerRolesService) { }

    @Get()
    async findAll() {
        return this.workerRolesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.workerRolesService.findOne(id);
    }

    @Post()
    async create(@Body() data: { name: string; description?: string; color?: string; permissionCodes?: string[] }) {
        return this.workerRolesService.create(data);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() data: { name?: string; description?: string; color?: string; permissionCodes?: string[] },
    ) {
        return this.workerRolesService.update(id, data);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.workerRolesService.delete(id);
    }

    @Post(':roleId/assign/:userId')
    async assignToUser(@Param('roleId') roleId: string, @Param('userId') userId: string) {
        return this.workerRolesService.assignToUser(userId, roleId);
    }

    @Post('unassign/:userId')
    async unassignFromUser(@Param('userId') userId: string) {
        return this.workerRolesService.assignToUser(userId, null);
    }
}
