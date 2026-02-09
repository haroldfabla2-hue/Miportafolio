import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Encryption Service - AES-256-GCM
 * 
 * Provides secure encryption/decryption for sensitive data like API keys.
 * Uses environment variable ENCRYPTION_KEY (32 bytes / 256 bits).
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

@Injectable()
export class EncryptionService {
    private getEncryptionKey(): Buffer {
        const key = process.env.ENCRYPTION_KEY;

        if (!key) {
            console.warn('⚠️ ENCRYPTION_KEY not set. Using fallback (NOT SECURE for production)');
            // Generate a deterministic but project-specific fallback
            return crypto.scryptSync('iris-crm-fallback-key', 'salt', 32);
        }

        // If key is hex-encoded (64 chars = 32 bytes)
        if (key.length === 64) {
            return Buffer.from(key, 'hex');
        }

        // Otherwise, derive key from the provided string
        return crypto.scryptSync(key, 'iris-crm-salt', 32);
    }

    /**
     * Encrypt a plaintext string
     * Returns: format iv:encrypted:tag (all hex-encoded)
     */
    encrypt(plaintext: string): string {
        const key = this.getEncryptionKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv) as crypto.CipherGCM;

        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const tag = cipher.getAuthTag();

        // Format: iv:encrypted:tag (all hex-encoded)
        return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
    }

    /**
     * Decrypt an encrypted string
     * Input: iv:encrypted:tag format from encrypt()
     */
    decrypt(encryptedData: string): string {
        try {
            const key = this.getEncryptionKey();
            const parts = encryptedData.split(':');

            if (parts.length !== 3) {
                throw new Error('Invalid encrypted data format');
            }

            const iv = Buffer.from(parts[0], 'hex');
            const encrypted = parts[1];
            const tag = Buffer.from(parts[2], 'hex');

            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv) as crypto.DecipherGCM;
            decipher.setAuthTag(tag);

            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Mask an API key for display (show first 4 and last 4 chars)
     */
    maskApiKey(key: string): string {
        if (!key || key.length < 12) return '••••••••';
        return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
    }

    /**
     * Validate API key format (basic check)
     */
    isValidApiKeyFormat(key: string, provider: string): boolean {
        switch (provider) {
            case 'gemini':
                return key.startsWith('AIza') && key.length >= 39;
            case 'openai':
                return key.startsWith('sk-') && key.length >= 40;
            case 'anthropic':
                return key.startsWith('sk-ant-') && key.length >= 40;
            default:
                return key.length >= 20;
        }
    }
}
