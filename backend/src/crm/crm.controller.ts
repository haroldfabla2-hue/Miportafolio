import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('CRM')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm')
export class CrmController {
    constructor(private readonly crmService: CrmService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get CRM Overview Statistics' })
    async getStats(@Req() req: any) {
        return this.crmService.getStats(req.user);
    }

    @Get('activities')
    @ApiOperation({ summary: 'Get Recent Activities' })
    async getActivities() {
        return this.crmService.getRecentActivities();
    }

    @Get('projects/active')
    @ApiOperation({ summary: 'Get Active Projects for Dashboard' })
    async getActiveProjects() {
        return this.crmService.getActiveProjects();
    }
}
