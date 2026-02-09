import { Injectable } from '@nestjs/common';
import * as OTPAuth from 'otpauth';

/**
 * TOTP Service for Two-Factor Authentication
 * 
 * Uses the otpauth library to generate and verify time-based one-time passwords.
 * Compatible with Google Authenticator, Authy, and other TOTP apps.
 */

const APP_NAME = 'Iris CRM';

@Injectable()
export class TotpService {
    /**
     * Generate a new TOTP secret for a user
     * @param userEmail - User's email for identification in authenticator app
     * @returns Object with secret (base32) and otpauth URI
     */
    generateSecret(userEmail: string): { secret: string; uri: string } {
        const totp = new OTPAuth.TOTP({
            issuer: APP_NAME,
            label: userEmail,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: new OTPAuth.Secret({ size: 20 }) // 20 bytes = 160 bits
        });

        return {
            secret: totp.secret.base32,
            uri: totp.toString()
        };
    }

    /**
     * Verify a TOTP code against a stored secret
     * @param secret - The base32 secret stored for the user
     * @param code - The 6-digit code from the authenticator app
     * @returns true if valid, false otherwise
     */
    verifyCode(secret: string, code: string): boolean {
        try {
            const totp = new OTPAuth.TOTP({
                issuer: APP_NAME,
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
                secret: OTPAuth.Secret.fromBase32(secret)
            });

            // Delta allows for 1 period of drift (30 seconds before/after)
            const delta = totp.validate({ token: code, window: 1 });

            // validate returns null if invalid, or the time offset if valid
            return delta !== null;
        } catch (error) {
            console.error('TOTP verification error:', error);
            return false;
        }
    }

    /**
     * Generate a QR code data URL for the TOTP URI
     * @param uri - The otpauth:// URI
     * @returns Promise<string> - Data URL for QR code image
     */
    async generateQRCode(uri: string): Promise<string> {
        const QRCode = await import('qrcode');
        return QRCode.toDataURL(uri, {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
    }
}
