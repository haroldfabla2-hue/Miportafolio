import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { PdfService } from './pdf.service';
import { Response } from 'express';

@Controller('finance')
export class FinanceController {
    constructor(
        private readonly financeService: FinanceService,
        private readonly pdfService: PdfService,
    ) { }

    @Get()
    getStats(@Req() req: any) {
        const user = req.user;
        return this.financeService.getFinancialStats(user);
    }

    @Get('summary')
    getSummary() {
        return this.financeService.getFinancialSummary();
    }

    @Get('chart')
    getChart(@Req() req: any) {
        const user = req.user;
        return this.financeService.getRevenueHistory(user);
    }

    // ==================== INVOICES ====================

    @Get('invoices')
    getInvoices(@Req() req: any) {
        const user = req.user;
        return this.financeService.getInvoices(user);
    }

    @Get('invoices/:id')
    getInvoice(@Param('id') id: string) {
        return this.financeService.getInvoice(id);
    }

    @Post('invoices')
    createInvoice(@Body() data: any) {
        return this.financeService.createInvoice(data);
    }

    @Put('invoices/:id')
    updateInvoice(@Param('id') id: string, @Body() data: any) {
        return this.financeService.updateInvoice(id, data);
    }

    @Delete('invoices/:id')
    deleteInvoice(@Param('id') id: string) {
        return this.financeService.deleteInvoice(id);
    }

    @Get('invoices/:id/pdf')
    async getInvoicePdf(@Param('id') id: string, @Res() res: Response) {
        const invoice = await this.financeService.getInvoice(id);
        const companyDetails = {
            name: 'Iris CRM',
            address: 'Your Business Address',
            email: 'billing@example.com',
        };
        const html = this.pdfService.getInvoiceTemplate(invoice, companyDetails);
        const pdfBuffer = await this.pdfService.generatePdf(html);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
    }

    // ==================== SUPPLIERS ====================

    @Get('suppliers')
    getSuppliers() {
        return this.financeService.getSuppliers();
    }

    @Get('suppliers/:id')
    getSupplier(@Param('id') id: string) {
        return this.financeService.getSupplier(id);
    }

    @Post('suppliers')
    createSupplier(@Body() data: any) {
        return this.financeService.createSupplier(data);
    }

    @Put('suppliers/:id')
    updateSupplier(@Param('id') id: string, @Body() data: any) {
        return this.financeService.updateSupplier(id, data);
    }

    @Delete('suppliers/:id')
    deleteSupplier(@Param('id') id: string) {
        return this.financeService.deleteSupplier(id);
    }

    // ==================== BILLS ====================

    @Get('bills')
    getBills() {
        return this.financeService.getBills();
    }

    @Get('bills/:id')
    getBill(@Param('id') id: string) {
        return this.financeService.getBill(id);
    }

    @Post('bills')
    createBill(@Body() data: any) {
        return this.financeService.createBill(data);
    }

    @Put('bills/:id')
    updateBill(@Param('id') id: string, @Body() data: any) {
        return this.financeService.updateBill(id, data);
    }

    @Delete('bills/:id')
    deleteBill(@Param('id') id: string) {
        return this.financeService.deleteBill(id);
    }

    // ==================== TIME LOGS ====================

    @Get('time-logs')
    getTimeLogs(@Query('projectId') projectId?: string) {
        return this.financeService.getTimeLogs(projectId);
    }

    @Post('time-logs')
    createTimeLog(@Body() data: any) {
        return this.financeService.createTimeLog(data);
    }
}

