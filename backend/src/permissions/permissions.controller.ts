import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @Get()
    @RequiresPermission('roles:manage')
    async findAll() {
        return this.permissionsService.findAll();
    }

    @Get('grouped')
    @RequiresPermission('roles:manage')
    async findGrouped() {
        return this.permissionsService.findByCategory();
    }
}
