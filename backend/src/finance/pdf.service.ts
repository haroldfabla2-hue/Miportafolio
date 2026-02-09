import { Injectable } from '@nestjs/common';

// Note: For production, puppeteer should be installed: npm install puppeteer
// For now, we provide a fallback HTML-based solution

@Injectable()
export class PdfService {
    private puppeteer: any;
    private puppeteerAvailable = false;

    constructor() {
        // Try to load puppeteer dynamically
        try {
            this.puppeteer = require('puppeteer');
            this.puppeteerAvailable = true;
        } catch {
            console.warn('Puppeteer not installed. PDF generation will return HTML.');
        }
    }

    async generatePdf(htmlContent: string): Promise<Buffer> {
        if (!this.puppeteerAvailable) {
            // Return HTML as buffer if puppeteer is not available
            return Buffer.from(htmlContent, 'utf-8');
        }

        let browser;
        try {
            browser = await this.puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    bottom: '40px',
                    left: '20px',
                    right: '20px'
                }
            });

            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            throw new Error('Failed to generate PDF');
        } finally {
            if (browser) await browser.close();
        }
    }

    getInvoiceTemplate(invoice: any, companyDetails: any): string {
        const items = invoice.items || [];
        const itemsHtml = items.map((item: any) => `
            <tr>
                <td>${item.description || item.name || 'Item'}</td>
                <td style="text-align: center">${item.quantity || 1}</td>
                <td style="text-align: right">$${(item.unitPrice || item.price || 0).toFixed(2)}</td>
                <td style="text-align: right">$${((item.quantity || 1) * (item.unitPrice || item.price || 0)).toFixed(2)}</td>
            </tr>
        `).join('');

        const subtotal = items.reduce((sum: number, item: any) =>
            sum + (item.quantity || 1) * (item.unitPrice || item.price || 0), 0
        );
        const taxRate = invoice.taxRate || 18;
        const taxAmount = subtotal * (taxRate / 100);
        const total = invoice.total || (subtotal + taxAmount);

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; padding: 40px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                    .title { font-size: 28px; font-weight: bold; color: #4f46e5; }
                    .invoice-info { color: #666; }
                    .company-info { text-align: right; }
                    .company-info h3 { margin: 0 0 5px 0; color: #333; }
                    .bill-to { margin-bottom: 30px; padding: 15px; background: #f9fafb; border-radius: 8px; }
                    .bill-to strong { color: #4f46e5; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { text-align: left; background: #f3f4f6; padding: 12px; font-weight: 600; }
                    td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
                    .totals { float: right; width: 300px; margin-top: 30px; }
                    .totals .row { display: flex; justify-content: space-between; padding: 8px 0; }
                    .grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 12px; margin-top: 8px; }
                    .notes { margin-top: 60px; padding: 15px; background: #f9fafb; border-radius: 8px; font-size: 12px; color: #666; }
                    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="title">INVOICE</div>
                        <div class="invoice-info">
                            <p><strong>#${invoice.number}</strong></p>
                            <p>Date: ${new Date(invoice.createdAt || new Date()).toLocaleDateString()}</p>
                            ${invoice.dueDate ? `<p>Due: ${new Date(invoice.dueDate).toLocaleDateString()}</p>` : ''}
                        </div>
                    </div>
                    <div class="company-info">
                        <h3>${companyDetails?.name || 'Your Company'}</h3>
                        <p>${companyDetails?.address || ''}</p>
                        <p>${companyDetails?.email || ''}</p>
                        <p>${companyDetails?.phone || ''}</p>
                    </div>
                </div>

                <div class="bill-to">
                    <strong>Bill To:</strong>
                    <p style="margin: 5px 0 0 0; font-size: 16px;">${invoice.client?.company || invoice.client?.name || 'Client'}</p>
                    <p style="margin: 2px 0; color: #666;">${invoice.client?.email || ''}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: center">Qty</th>
                            <th style="text-align: right">Price</th>
                            <th style="text-align: right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="row">
                        <span>Subtotal:</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="row">
                        <span>Tax (${taxRate}%):</span>
                        <span>$${taxAmount.toFixed(2)}</span>
                    </div>
                    <div class="row grand-total">
                        <span>Total:</span>
                        <span>$${total.toFixed(2)} ${invoice.currency || 'USD'}</span>
                    </div>
                </div>

                <div style="clear: both;"></div>

                <div class="notes">
                    <p><strong>Notes:</strong></p>
                    <p>${invoice.notes || 'Thank you for your business!'}</p>
                </div>

                <div class="footer">
                    <p>Generated by Iris CRM</p>
                </div>
            </body>
            </html>
        `;
    }
}
