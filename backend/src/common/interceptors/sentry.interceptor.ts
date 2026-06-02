import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError((error) => {
                const request = context.switchToHttp().getRequest();
                
                // Track User if available
                if (request.user) {
                    Sentry.setUser({ 
                        id: request.user.id,
                        email: request.user.email,
                        username: request.user.name 
                    });
                }

                Sentry.captureException(error, {
                    tags: {
                        path: request.url,
                        method: request.method,
                        ip: request.ip
                    },
                    extra: {
                        body: request.body,
                        query: request.query
                    }
                });
                
                throw error;
            }),
        );
    }
}
