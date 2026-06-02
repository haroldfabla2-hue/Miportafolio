import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly key: Buffer;
    private readonly logger = new Logger(CryptoService.name);

    constructor(private configService: ConfigService) {
        // En producción, ENCRYPTION_KEY debe ser de 32 bytes (256 bits)
        const secret = this.configService.get<string>('ENCRYPTION_KEY') || 'default_secret_key_needs_32_bytes!';
        // Ensure key is exactly 32 bytes long
        this.key = crypto.scryptSync(secret, 'salt', 32);
    }

    encrypt(text: string): string {
        if (!text) return text;
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
            
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            // Format: iv:authTag:encryptedText
            return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
        } catch (error) {
            this.logger.error('Encryption failed', error);
            throw new Error('Encryption failed');
        }
    }

    decrypt(encryptedText: string): string {
        if (!encryptedText || !encryptedText.includes(':')) return encryptedText; // Pass through if not encrypted properly
        
        try {
            const parts = encryptedText.split(':');
            if (parts.length !== 3) throw new Error('Invalid encrypted text format');
            
            const iv = Buffer.from(parts[0], 'hex');
            const authTag = Buffer.from(parts[1], 'hex');
            const encrypted = parts[2];
            
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
            decipher.setAuthTag(authTag);
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            this.logger.error('Decryption failed', error);
            throw new Error('Decryption failed');
        }
    }
}
