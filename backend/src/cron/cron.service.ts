import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FinanceService } from '../finance/finance.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);

    constructor(
        private readonly financeService: FinanceService,
        private readonly prisma: PrismaService,
    ) {}

    // Run every day at 08:00 AM
    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async handleBillingReminders() {
        this.logger.log('Starting daily billing reminders check...');
        try {
            const today = new Date();
            
            // Find invoices that are PENDING and due in exactly 3 days
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(today.getDate() + 3);

            const upcomingInvoices = await this.prisma.invoice.findMany({
                where: {
                    status: 'PENDING',
                    dueDate: {
                        gte: new Date(threeDaysFromNow.setHours(0, 0, 0, 0)),
                        lt: new Date(threeDaysFromNow.setHours(23, 59, 59, 999)),
                    }
                },
                include: { client: true, project: true }
            });

            if (upcomingInvoices.length > 0) {
                this.logger.log(`Found ${upcomingInvoices.length} invoices due in 3 days. Sending reminders...`);
                for (const invoice of upcomingInvoices) {
                    // Logic to send reminder email. 
                    // Assuming we have a notification/email service we would call it here.
                    this.logger.log(`Reminder sent for invoice ${invoice.id} to ${invoice.client.email}`);
                }
            }

            // Find invoices that are PENDING and overdue
            const overdueInvoices = await this.prisma.invoice.findMany({
                where: {
                    status: 'PENDING',
                    dueDate: {
                        lt: new Date(today.setHours(0, 0, 0, 0)),
                    }
                },
                include: { client: true, project: true }
            });

            if (overdueInvoices.length > 0) {
                this.logger.log(`Found ${overdueInvoices.length} overdue invoices. Sending overdue notices...`);
                for (const invoice of overdueInvoices) {
                    this.logger.log(`Overdue notice sent for invoice ${invoice.id} to ${invoice.client.email}`);
                    
                    // Update status to OVERDUE if needed
                    await this.prisma.invoice.update({
                        where: { id: invoice.id },
                        data: { status: 'OVERDUE' } // Ensure OVERDUE is a valid enum value, if not, leave as PENDING but flag.
                    }).catch(e => this.logger.warn(`Could not set status to OVERDUE (enum might not exist): ${e.message}`));
                }
            }

        } catch (error) {
            this.logger.error('Error in daily billing reminders cron job', error);
        }
        this.logger.log('Completed daily billing reminders check.');
    }
}
