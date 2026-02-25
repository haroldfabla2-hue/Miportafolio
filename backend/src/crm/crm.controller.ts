import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';

@ApiTags('CRM')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('crm')
export class CrmController {
    constructor(private readonly crmService: CrmService) { }

    @Get('stats')
    @RequiresPermission('dashboard:view')
    @ApiOperation({ summary: 'Get CRM Overview Statistics' })
    async getStats(@Req() req: any) {
        return this.crmService.getStats(req.user);
    }

    @Get('activities')
    @RequiresPermission('dashboard:view')
    @ApiOperation({ summary: 'Get Recent Activities' })
    async getActivities(@Req() req: any) {
        return this.crmService.getRecentActivities(req.user);
    }

    @Get('projects/active')
    @RequiresPermission('projects:view')
    @ApiOperation({ summary: 'Get Active Projects for Dashboard' })
    async getActiveProjects(@Req() req: any) {
        return this.crmService.getActiveProjects(req.user);
    }
}
