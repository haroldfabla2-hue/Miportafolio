import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { WorkerRolesService } from './worker-roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';

@Controller('worker-roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class WorkerRolesController {
    constructor(private readonly workerRolesService: WorkerRolesService) { }

    @Get()
    @RequiresPermission('roles:manage')
    async findAll() {
        return this.workerRolesService.findAll();
    }

    @Get(':id')
    @RequiresPermission('roles:manage')
    async findOne(@Param('id') id: string) {
        return this.workerRolesService.findOne(id);
    }

    @Post()
    @RequiresPermission('roles:manage')
    async create(@Body() data: { name: string; description?: string; color?: string; permissionCodes?: string[] }) {
        return this.workerRolesService.create(data);
    }

    @Put(':id')
    @RequiresPermission('roles:manage')
    async update(
        @Param('id') id: string,
        @Body() data: { name?: string; description?: string; color?: string; permissionCodes?: string[] },
    ) {
        return this.workerRolesService.update(id, data);
    }

    @Delete(':id')
    @RequiresPermission('roles:manage')
    async delete(@Param('id') id: string) {
        return this.workerRolesService.delete(id);
    }

    @Post(':roleId/assign/:userId')
    @RequiresPermission('roles:manage')
    async assignToUser(@Param('roleId') roleId: string, @Param('userId') userId: string) {
        return this.workerRolesService.assignToUser(userId, roleId);
    }

    @Post('unassign/:userId')
    @RequiresPermission('roles:manage')
    async unassignFromUser(@Param('userId') userId: string) {
        return this.workerRolesService.assignToUser(userId, null);
    }
}
