import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Ensure user exists (guarded by JwtAuthGuard usually) and has ADMIN or SUPER_ADMIN role
        return user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
    }
}
