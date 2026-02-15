import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get()
    getAll() {
        return this.reportsService.getAllReports();
    }

    @Get(':id')
    getOne(@Param('id') id: string) {
        return this.reportsService.getReport(id);
    }

    @Post('generate')
    generate(@Body() body: { type: string; prompt: string }, @Req() req: any) {
        return this.reportsService.generateReport(body.type, body.prompt, req.user.id);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.reportsService.deleteReport(id);
    }
}
