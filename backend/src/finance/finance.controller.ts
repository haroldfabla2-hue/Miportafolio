import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { PdfService } from './pdf.service';
import { Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('finance')
export class FinanceController {
    constructor(
        private readonly financeService: FinanceService,
        private readonly pdfService: PdfService,
    ) { }

    @Get()
    @RequiresPermission('finance:view')
    getStats(@Req() req: any) {
        const user = req.user;
        return this.financeService.getFinancialStats(user);
    }

    @Get('summary')
    @RequiresPermission('finance:view')
    getSummary(@Req() req: any) {
        return this.financeService.getFinancialSummary(req.user);
    }

    @Get('chart')
    @RequiresPermission('finance:view')
    getChart(@Req() req: any) {
        const user = req.user;
        return this.financeService.getRevenueHistory(user);
    }

    // ==================== INVOICES ====================

    @Get('invoices')
    @RequiresPermission('finance:view')
    getInvoices(@Req() req: any) {
        const user = req.user;
        return this.financeService.getInvoices(user);
    }

    @Get('invoices/:id')
    @RequiresPermission('finance:view')
    getInvoice(@Param('id') id: string, @Req() req: any) {
        return this.financeService.getInvoice(id, req.user);
    }

    @Post('invoices')
    @RequiresPermission('finance:manage')
    createInvoice(@Body() data: any) {
        return this.financeService.createInvoice(data);
    }

    @Put('invoices/:id')
    @RequiresPermission('finance:manage')
    updateInvoice(@Param('id') id: string, @Body() data: any) {
        return this.financeService.updateInvoice(id, data);
    }

    @Delete('invoices/:id')
    @RequiresPermission('finance:manage')
    deleteInvoice(@Param('id') id: string) {
        return this.financeService.deleteInvoice(id);
    }

    @Get('invoices/:id/pdf')
    @RequiresPermission('finance:view')
    async getInvoicePdf(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
        const invoice = await this.financeService.getInvoice(id, req.user);
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
    @RequiresPermission('finance:view')
    getSuppliers() {
        return this.financeService.getSuppliers();
    }

    @Get('suppliers/:id')
    @RequiresPermission('finance:view')
    getSupplier(@Param('id') id: string) {
        return this.financeService.getSupplier(id);
    }

    @Post('suppliers')
    @RequiresPermission('finance:manage')
    createSupplier(@Body() data: any) {
        return this.financeService.createSupplier(data);
    }

    @Put('suppliers/:id')
    @RequiresPermission('finance:manage')
    updateSupplier(@Param('id') id: string, @Body() data: any) {
        return this.financeService.updateSupplier(id, data);
    }

    @Delete('suppliers/:id')
    @RequiresPermission('finance:manage')
    deleteSupplier(@Param('id') id: string) {
        return this.financeService.deleteSupplier(id);
    }

    // ==================== BILLS ====================

    @Get('bills')
    @RequiresPermission('finance:view')
    getBills() {
        return this.financeService.getBills();
    }

    @Get('bills/:id')
    @RequiresPermission('finance:view')
    getBill(@Param('id') id: string) {
        return this.financeService.getBill(id);
    }

    @Post('bills')
    @RequiresPermission('finance:manage')
    createBill(@Body() data: any) {
        return this.financeService.createBill(data);
    }

    @Put('bills/:id')
    @RequiresPermission('finance:manage')
    updateBill(@Param('id') id: string, @Body() data: any) {
        return this.financeService.updateBill(id, data);
    }

    @Delete('bills/:id')
    @RequiresPermission('finance:manage')
    deleteBill(@Param('id') id: string) {
        return this.financeService.deleteBill(id);
    }

    // ==================== TIME LOGS ====================

    @Get('time-logs')
    @RequiresPermission('finance:view')
    getTimeLogs(@Req() req: any, @Query('projectId') projectId?: string) {
        return this.financeService.getTimeLogs(req.user, projectId);
    }

    @Post('time-logs')
    @RequiresPermission('finance:manage')
    createTimeLog(@Body() data: any) {
        return this.financeService.createTimeLog(data);
    }
}
