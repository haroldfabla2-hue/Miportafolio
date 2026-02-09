import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Health Check Controller
 * Provides endpoints for monitoring and deployment health checks
 */
@Controller('health')
@SkipThrottle() // Don't rate limit health checks
export class HealthController {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Basic health check - just returns OK
     * Used by load balancers and Docker health checks
     */
    @Get()
    @Public()
    async check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Deep health check - includes database connectivity
     * Use for detailed monitoring
     */
    @Get('deep')
    @Public()
    async deepCheck() {
        let dbStatus = 'ok';

        try {
            // Simple query to check DB connectivity
            await this.prisma.$queryRaw`SELECT 1`;
        } catch (error) {
            dbStatus = 'error';
        }

        return {
            status: dbStatus === 'ok' ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            checks: {
                database: dbStatus,
            },
        };
    }
}
