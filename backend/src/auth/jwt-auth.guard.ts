import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
        private reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (isPublic) {
                return true;
            }
        } catch (e) {
            throw e;
        }

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException();
        }

        const token = authHeader.split(' ')[1];

        try {
            const secret = this.configService.get('JWT_SECRET') || 'your-jwt-secret-change-in-prod';
            // Debug Log
            // console.log('Verifying token:', token.substring(0, 10) + '...', 'with secret starting:', secret.substring(0, 4));

            const payload = jwt.verify(token, secret) as any;

            // Attach user payload to request
            request.user = {
                id: payload.sub,
                email: payload.username,
                role: payload.role
            };

            return true;
        } catch (error) {
            throw new UnauthorizedException();
        }
    }
}
