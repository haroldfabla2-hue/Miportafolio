import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Zero-Trust Security Guard
 * Evaluates context at the AST/Route level for strict security requirements.
 */
@Injectable()
export class SecurityGuard implements CanActivate {
    private readonly logger = new Logger(SecurityGuard.name);

    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        
        // Exclude public routes (login, webhooks)
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const user = request.user;
        if (!user) {
            this.logger.warn(`Unauthorized access attempt from IP: ${request.ip}`);
            throw new UnauthorizedException('Zero-Trust: Missing authentication context');
        }

        // 1. Mandatory 2FA Check for ADMIN/SUPER_ADMIN on critical routes
        const isCriticalRoute = this.reflector.getAllAndOverride<boolean>('isCritical', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isCriticalRoute && ['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            if (!user.twoFactorEnabled) {
                this.logger.error(`Zero-Trust: Admin ${user.id} attempted critical action without 2FA`);
                throw new ForbiddenException('Zero-Trust: 2FA is mandatory for this operation');
            }
        }

        // 2. Strict Request Payload Inspection (No Nosql Injection patterns)
        if (request.body && typeof request.body === 'object') {
            const bodyStr = JSON.stringify(request.body).toLowerCase();
            if (bodyStr.includes('$where') || bodyStr.includes('$ne')) {
                this.logger.error(`Zero-Trust: Possible injection detected from ${user.id}`);
                throw new ForbiddenException('Zero-Trust: Malicious payload detected');
            }
        }

        return true;
    }
}
