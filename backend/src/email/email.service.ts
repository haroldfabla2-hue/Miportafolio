import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailService {
    constructor(@InjectQueue('email') private emailQueue: Queue) {}

    async enqueueWelcomeEmail(email: string, name: string, pdfUrl?: string) {
        await this.emailQueue.add('send-welcome', { email, name, pdfUrl }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            }
        });
    }
}
