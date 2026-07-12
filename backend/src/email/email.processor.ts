import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Processor('email')
export class EmailProcessor {
    private resend: Resend;

    constructor(private configService: ConfigService) {
        // Will use dummy key if not present so it doesn't crash on start
        const apiKey = this.configService.get('RESEND_API_KEY') || 'dummy_key';
        this.resend = new Resend(apiKey);
    }

    @Process('send-welcome')
    async handleSendWelcome(job: Job<{ email: string, name: string, pdfUrl?: string }>) {
        const { email, name, pdfUrl } = job.data;
        
        // Skip actual sending if we don't have a valid API key configured
        if (!this.configService.get('RESEND_API_KEY')) {
            console.log(`ℹ️  [Dev Mode] Would have sent email to ${email} (No RESEND_API_KEY)`);
            return;
        }
        
        try {
            await this.resend.emails.send({
                from: 'Silhouette <hello@your-domain.com>',
                to: email,
                subject: `Welcome to Silhouette, ${name}!`,
                html: `
                    <h2>Hi ${name},</h2>
                    <p>Thank you for reaching out to us. We have received your request and will get back to you shortly.</p>
                    ${pdfUrl ? `<p>Here is the link to your ROI Report: <a href="${pdfUrl}">View Report</a></p>` : ''}
                    <br/>
                    <p>Best regards,</p>
                    <p>Alberto</p>
                `,
            });
            console.log(`✅ Welcome email sent to ${email}`);
        } catch (error) {
            console.error(`❌ Failed to send welcome email to ${email}:`, error);
            throw error; // Let Bull retry it
        }
    }
}
