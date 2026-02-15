import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { TotpService } from './totp.service';
import { TokenService } from './token.service';
import { PermissionsService } from '../permissions/permissions.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private oauth2Client;

    constructor(
        private usersService: UsersService,
        private prisma: PrismaService,
        private configService: ConfigService,
        private totpService: TotpService,
        private tokenService: TokenService,
        private permissionsService: PermissionsService
    ) {
        this.oauth2Client = new google.auth.OAuth2(
            this.configService.get('GOOGLE_CLIENT_ID'),
            this.configService.get('GOOGLE_CLIENT_SECRET'),
            'postmessage'
        );
    }

    async validateUser(email: string, pass: string): Promise<any> {
        try {
            const user = await this.usersService.findOne(email);
            if (user && user.password) {
                const isValid = await bcrypt.compare(pass, user.password);
                if (isValid) {
                    const { password, ...result } = user;
                    return result;
                }
            }
            return null;
        } catch (e) {
            console.error('validateUser error:', e.message);
            throw e;
        }
    }

    async register(email: string, password: string, name: string) {
        const existing = await this.usersService.findOne(email);
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const user = await this.usersService.create({
            email,
            password,
            name,
            role: 'CLIENT',
        });

        return this.login(user);
    }

    async login(user: any, isTwoFactorVerified = false) {

        // Check if 2FA is enabled and not yet verified
        if (user.twoFactorEnabled && !isTwoFactorVerified) {
            return {
                requiresTwoFactor: true,
                userId: user.id,
                email: user.email
            };
        }

        try {
            const payload = { sub: user.id, username: user.email, role: user.role };
            const tokens = await this.tokenService.generateTokenPair(payload);
            const permissions = await this.permissionsService.getUserPermissions(user.id);

            return {
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar,
                    twoFactorEnabled: user.twoFactorEnabled,
                    onboardingCompleted: user.onboardingCompleted,
                    phone: user.phone,
                    jobTitle: user.jobTitle,
                    assignedDriveFolderName: user.assignedDriveFolderName,
                    permissions: permissions
                },
            };
        } catch (error) {
            console.error('CRITICAL ERROR in AuthService.login:', error);
            throw error;
        }
    }

    async verifyTwoFactorLogin(userId: string, code: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorSecret) {
            throw new UnauthorizedException('Invalid user or 2FA not enabled');
        }

        const isValid = this.totpService.verifyCode(user.twoFactorSecret, code);
        if (!isValid) {
            throw new UnauthorizedException('Invalid 2FA code');
        }

        return this.login(user, true);
    }

    async refreshToken(token: string) {
        try {
            const tokens = await this.tokenService.rotateRefreshToken(token);

            if (!tokens) {
                throw new UnauthorizedException('Invalid or expired refresh token');
            }

            // We need to fetch the user to get permissions (and return user info)
            // Extract userId from new access token to find user
            const userId = (this.tokenService.verifyAccessToken(tokens.accessToken) as any).sub;
            const user = await this.usersService.findById(userId);
            const permissions = await this.permissionsService.getUserPermissions(user.id);

            return {
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar,
                    twoFactorEnabled: user.twoFactorEnabled,
                    onboardingCompleted: user.onboardingCompleted,
                    phone: user.phone,
                    jobTitle: user.jobTitle,
                    assignedDriveFolderName: user.assignedDriveFolderName,
                    permissions: permissions
                },
            };
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async loginWithGoogle(credential: string, code: string, scopes: string[]) {
        try {
            let email: string;
            let name: string;
            let googleId: string;
            let accessToken: string | undefined;
            let refreshToken: string | undefined;

            if (code) {
                // Authorization code flow
                const { tokens } = await this.oauth2Client.getToken(code);
                this.oauth2Client.setCredentials(tokens);
                accessToken = tokens.access_token || undefined;
                refreshToken = tokens.refresh_token || undefined;

                const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
                const { data } = await oauth2.userinfo.get();
                email = data.email!;
                name = data.name || data.email!;
                googleId = data.id!;
            } else if (credential) {
                // ID token flow (Google Sign-In button)
                const ticket = await this.oauth2Client.verifyIdToken({
                    idToken: credential,
                    audience: this.configService.get('GOOGLE_CLIENT_ID'),
                });
                const payload = ticket.getPayload();
                email = payload!.email!;
                name = payload!.name || payload!.email!;
                googleId = payload!.sub;
            } else {
                throw new UnauthorizedException('No credential or code provided');
            }

            // Find or create user
            let user = await this.prisma.user.findUnique({ where: { email } });

            if (!user) {
                user = await this.prisma.user.create({
                    data: {
                        email,
                        name,
                        role: 'CLIENT',
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                    },
                });
            }

            // Store Google tokens in dedicated fields (for Gmail, Drive access)
            if (accessToken || refreshToken) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleAccessToken: accessToken,
                        googleRefreshToken: refreshToken || user.googleRefreshToken, // Keep existing if no new one
                        googleTokenExpiry: new Date(Date.now() + 3600 * 1000), // 1 hour default
                        googleScopes: scopes,
                        googleConnected: true,
                    },
                });
            }

            // Note: Google login bypasses 2FA in this implementation for simplicity, 
            // assuming Google account itself is secure. 
            // To enforce app-level 2FA for Google users, pass false here.
            return this.login(user, true);
        } catch (error) {
            console.error('Google auth error:', error);
            throw new UnauthorizedException('Google authentication failed');
        }
    }
    async completeInvitation(token: string, password: string): Promise<any> {
        // 1. Find Invitation
        const invitation = await this.prisma.invitation.findUnique({
            where: { token },
            include: { invitedBy: true } // Optional: log who invited them
        });

        if (!invitation) {
            throw new NotFoundException('Invalid invitation token');
        }

        if (invitation.status !== 'PENDING') {
            throw new ConflictException('Invitation already accepted or expired');
        }

        if (invitation.expiresAt && new Date() > invitation.expiresAt) {
            await this.prisma.invitation.update({
                where: { id: invitation.id },
                data: { status: 'EXPIRED' }
            });
            throw new UnauthorizedException('Invitation expired');
        }

        // 2. Find User
        const user = await this.prisma.user.findUnique({ where: { email: invitation.email } });
        if (!user) {
            throw new NotFoundException('User for this invitation not found');
        }

        // 3. Update User Password
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        // 4. Update Invitation Status
        await this.prisma.invitation.update({
            where: { id: invitation.id },
            data: {
                status: 'ACCEPTED',
                acceptedAt: new Date()
            }
        });

        // 5. Log User In
        return this.login(updatedUser);
    }
}
