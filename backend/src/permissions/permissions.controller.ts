import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @Get()
    async findAll() {
        return this.permissionsService.findAll();
    }

    @Get('grouped')
    async findGrouped() {
        return this.permissionsService.findByCategory();
    }
}
