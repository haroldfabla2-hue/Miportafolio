import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditInterceptor.name);

    constructor(private readonly auditLogsService: AuditLogsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const user = req.user;

        // Only log write operations (POST, PUT, DELETE, PATCH)
        // AND ensure user is authenticated
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) && user) {
            return next.handle().pipe(
                tap(async (data) => {
                    try {
                        const path = req.route ? req.route.path : req.url;
                        const action = `${method} ${path}`;

                        // Determine entity/details from response or body
                        // Be careful not to log sensitive large data
                        const details = {
                            body: req.body, // Consider sanitizing passwords
                            params: req.params,
                            query: req.query,
                        };

                        // Sanitize sensitive fields
                        const sensitiveFields = ['password', 'refreshToken', 'token', 'secret', 'twoFactorSecret', 'credential', 'code'];
                        if (details.body) {
                            sensitiveFields.forEach(field => {
                                if (details.body[field]) {
                                    details.body[field] = '***';
                                }
                            });
                        }

                        await this.auditLogsService.logAction({
                            userId: user.id,
                            action: action, // e.g., "POST /api/projects"
                            ipAddress: req.ip,
                            userAgent: req.headers['user-agent'],
                            details: details
                        });
                    } catch (error) {
                        this.logger.error('Failed to log audit action', error);
                    }
                }),
            );
        }

        return next.handle();
    }
}
