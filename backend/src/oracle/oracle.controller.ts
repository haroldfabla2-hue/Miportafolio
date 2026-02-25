
import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { OracleService } from './oracle.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('oracle')
@UseGuards(JwtAuthGuard, AdminGuard)
export class OracleController {
    constructor(private readonly oracleService: OracleService) { }

    @Post('simulate')
    async runSimulation(@Req() req, @Body() body: { scenario: any }) {
        // req.user is populated by JwtAuthGuard
        return this.oracleService.runSimulation(body.scenario, req.user.role);
    }

    @Post('advisor')
    async askOracle(@Req() req, @Body() body: { context: string; prompt: string }) {
        return this.oracleService.askOracle(body.context, body.prompt, req.user.role);
    }

    @Get('dashboard')
    async getDashboard(@Req() req) {
        return this.oracleService.getDashboardData(req.user.role);
    }
}
