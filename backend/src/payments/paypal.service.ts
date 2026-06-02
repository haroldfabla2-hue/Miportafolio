import { Injectable, Logger } from '@nestjs/common';
import { FinanceService } from '../finance/finance.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaypalService {
    private readonly logger = new Logger(PaypalService.name);

    constructor(
        private readonly financeService: FinanceService,
        private readonly notificationsService: NotificationsService,
        private readonly prisma: PrismaService,
    ) {}

    async handleWebhook(body: any, headers: any) {
        this.logger.log(`Received PayPal Webhook: ${body.event_type}`);

        // In production, you would verify the webhook signature using PayPal's API
        // using the headers and body.

        const eventType = body.event_type;
        const resource = body.resource;

        if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            // Assume the custom_id or invoice_id holds our internal invoice ID
            // For example, if we pass it in custom_id during order creation
            let invoiceId = null;

            if (resource.custom_id) {
                invoiceId = resource.custom_id;
            } else if (resource.purchase_units && resource.purchase_units.length > 0) {
                invoiceId = resource.purchase_units[0].custom_id || resource.purchase_units[0].invoice_id;
            }

            if (invoiceId) {
                try {
                    await this.financeService.updateInvoice(invoiceId, { status: 'PAID' });
                    this.logger.log(`Invoice ${invoiceId} marked as PAID via PayPal webhook.`);

                    // Fetch invoice to notify the user
                    const invoice = await this.financeService.getInvoice(invoiceId, { role: 'ADMIN' }); // Override user context
                    if (invoice && invoice.client && invoice.client.email) {
                        const clientUser = await this.prisma.user.findUnique({ where: { email: invoice.client.email }});
                        if (clientUser) {
                            await this.notificationsService.create({
                                userId: clientUser.id,
                                title: 'Payment Received',
                                message: `Your payment for Invoice #${invoice.number} was successful. Thank you!`,
                                type: 'FINANCE',
                                entityType: 'INVOICE',
                                entityId: invoice.id
                            });
                        }
                    }
                } catch (error) {
                    this.logger.error(`Failed to update invoice ${invoiceId}: ${error.message}`);
                }
            } else {
                this.logger.warn('No invoice_id or custom_id found in PayPal webhook payload.');
            }
        }

        return { received: true };
    }
}
