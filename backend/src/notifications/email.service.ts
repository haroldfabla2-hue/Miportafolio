import { Injectable, Logger } from '@nestjs/common';
import { DLQService } from '../common/dlq.service';
import { CircuitBreakerService } from '../common/circuit-breaker.service';

export interface EmailPayload {
    to: string;
    subject: string;
    body: string;
    isHtml?: boolean;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(
        private readonly dlqService: DLQService,
        private readonly circuitBreaker: CircuitBreakerService
    ) {}

    /**
     * Sends an email using Circuit Breaker and DLQ fallback.
     */
    async sendEmail(payload: EmailPayload): Promise<boolean> {
        return this.circuitBreaker.execute<boolean>(
            'EMAIL_PROVIDER',
            async () => {
                // Here we would use nodemailer or sendgrid SDK.
                // Simulating an external network call:
                this.logger.log(`Attempting to send email to ${payload.to}...`);
                
                // Simulation of possible failure
                if (Math.random() < 0.1) {
                    throw new Error('SMTP Connection Timeout');
                }
                
                this.logger.log(`Email successfully sent to ${payload.to}`);
                return true;
            },
            async () => {
                // FALLBACK ACTION: When the circuit is OPEN or the request fails
                this.logger.error(`Failed to send email to ${payload.to}. Routing to DLQ.`);
                await this.dlqService.pushToDLQ('email', payload, 'Service unavailable or Circuit Open');
                return false; // Return false so the caller knows it was delayed
            },
            { failureThreshold: 3, resetTimeout: 60000 } // Wait 1 minute if it fails 3 times
        );
    }
}
