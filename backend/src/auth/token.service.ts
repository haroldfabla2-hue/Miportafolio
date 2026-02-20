import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

/**
 * Token Service - JWT with Refresh Token Rotation
 * 
 * Implements secure token lifecycle management with:
 * - Short-lived access tokens (15 min)
 * - Long-lived refresh tokens (7 days) stored hashed in DB
 * - Token rotation on refresh
 */

export interface TokenPayload {
    sub: string;      // Subject (User ID)
    username: string; // Email
    role: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;  // Access token expiry in seconds
}

@Injectable()
export class TokenService {
    private readonly jwtSecret: string;
    private readonly accessExpiry: string;
    private readonly refreshExpiry: string;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.jwtSecret = this.configService.get('JWT_SECRET') || 'your-jwt-secret-change-in-prod';
        this.accessExpiry = this.configService.get('JWT_ACCESS_EXPIRY') || '15m';
        this.refreshExpiry = this.configService.get('JWT_REFRESH_EXPIRY') || '7d';
    }

    private parseExpiry(expiry: string): number {
        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match) return 900; // Default 15 minutes

        const value = parseInt(match[1], 10);
        const unit = match[2];

        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 60 * 60;
            case 'd': return value * 60 * 60 * 24;
            default: return 900;
        }
    }

    /**
     * Generate an access token (short-lived)
     */
    generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.accessExpiry as any
        } as jwt.SignOptions);
    }

    /**
     * Generate a refresh token (long-lived, stored hashed in DB)
     */
    /**
     * Generate a refresh token (long-lived, stored hashed in DB)
     */
    async generateRefreshToken(userId: string): Promise<string> {
        // Generate a cryptographically secure random token
        const refreshToken = crypto.randomBytes(64).toString('hex');

        // Hash it before storing (we only store the hash)
        const tokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        // Calculate expiry
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + this.parseExpiry(this.refreshExpiry));

        // Cleanup: Delete expired tokens for reliability (Pseudo-CRON)
        // In PROD, use a real Cron Job.
        await this.prisma.refreshToken.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });

        // Create new token (Multi-Device Support: Do NOT delete existing valid tokens)
        await this.prisma.refreshToken.create({
            data: {
                userId,
                token: tokenHash,
                expiresAt,
            },
        });

        return refreshToken;
    }

    /**
     * Generate both access and refresh tokens
     */
    async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = await this.generateRefreshToken(payload.sub);

        return {
            accessToken,
            refreshToken,
            expiresIn: this.parseExpiry(this.accessExpiry),
        };
    }

    /**
     * Verify access token
     */
    verifyAccessToken(token: string): TokenPayload | null {
        try {
            return jwt.verify(token, this.jwtSecret) as TokenPayload;
        } catch (error) {
            // Token expired, malformed, or invalid signature
            return null;
        }
    }

    /**
     * Verify and rotate refresh token with Grace Period (30s)
     */
    async rotateRefreshToken(refreshToken: string): Promise<TokenPair | null> {
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: tokenHash },
        });

        if (!storedToken) return null;

        // GRACE PERIOD LOGIC
        // If token is revoked, check if it's within grace period (e.g. 30 seconds)
        if (storedToken.revokedAt) {
            const gracePeriodEnd = new Date(storedToken.revokedAt.getTime() + 30 * 1000); // 30s
            if (new Date() > gracePeriodEnd) {
                // Reuse outside grace period -> Security Alert! (Revoke all?)
                // For now, just reject.
                return null;
            }
            // Inside grace period: Allow rotation (This creates a parallel valid token branch)
        }

        const user = await this.prisma.user.findUnique({ where: { id: storedToken.userId } });
        if (!user) return null;

        // Generate NEW refresh token
        const newRefreshTokenRaw = crypto.randomBytes(64).toString('hex');
        const newTokenHash = crypto.createHash('sha256').update(newRefreshTokenRaw).digest('hex');

        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + this.parseExpiry(this.refreshExpiry));

        // Transaction: Revoke Old + Create New
        await this.prisma.$transaction([
            this.prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: {
                    revokedAt: storedToken.revokedAt || new Date(), // Keep original revoke time if setting again
                    replacedByToken: newTokenHash
                }
            }),
            this.prisma.refreshToken.create({
                data: {
                    userId: user.id,
                    token: newTokenHash,
                    expiresAt,
                }
            })
        ]);

        const accessToken = this.generateAccessToken({
            sub: user.id,
            username: user.email,
            role: user.role,
        });

        return {
            accessToken,
            refreshToken: newRefreshTokenRaw,
            expiresIn: this.parseExpiry(this.accessExpiry),
        };
    }

    /**
     * Revoke a user's refresh token (logout)
     */
    async revokeRefreshToken(userId: string): Promise<void> {
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }

    /**
     * Revoke all refresh tokens (security breach response)
     */
    async revokeAllRefreshTokens(): Promise<number> {
        const result = await this.prisma.refreshToken.deleteMany({});
        return result.count;
    }
}
