import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
    constructor(private readonly auditLogsService: AuditLogsService) { }

    @Get()
    @UseGuards(AdminGuard)
    findAll(@Query('limit') limit?: string) {
        return this.auditLogsService.findAll(limit ? parseInt(limit) : 50);
    }

    @Get('my-logs')
    findMyLogs(@Req() req: any, @Query('limit') limit?: string) {
        return this.auditLogsService.findByUser(req.user.id, limit ? parseInt(limit) : 50);
    }
}
