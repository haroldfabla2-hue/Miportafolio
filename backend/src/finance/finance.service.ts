import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FinanceService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async getInvoices(user: any) {
        let whereClause: any = {};

        if (user.role === 'CLIENT') {
            const client = await this.prisma.client.findFirst({
                where: { email: user.email },
            });
            if (client) {
                whereClause = { clientId: client.id };
            }
        }

        return this.prisma.invoice.findMany({
            where: whereClause,
            include: {
                client: { select: { id: true, name: true, email: true } },
                project: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getInvoice(id: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                client: true,
                project: true,
            },
        });
        if (!invoice) throw new NotFoundException('Invoice not found');
        return invoice;
    }

    async createInvoice(data: any) {
        // Calculate total from items (stored as JSON)
        const items = data.items || [];
        const total = items.reduce((sum: number, item: any) =>
            sum + (item.quantity || 1) * (item.unitPrice || item.price || 0), 0
        );

        const invoice = await this.prisma.invoice.create({
            data: {
                number: data.number,
                status: data.status || 'DRAFT',
                total,
                clientId: data.clientId,
                projectId: data.projectId,
                items: items, // JSON field
            },
            include: {
                client: true,
                project: true,
            },
        });

        // Notify Client (if they have a User account)
        if (invoice.client && invoice.client.email) {
            const clientUser = await this.prisma.user.findUnique({
                where: { email: invoice.client.email }
            });

            if (clientUser) {
                await this.notificationsService.create({
                    userId: clientUser.id,
                    title: 'New Invoice Received',
                    message: `Invoice #${invoice.number} for $${invoice.total} has been generated.`,
                    type: 'FINANCE',
                    entityType: 'INVOICE',
                    entityId: invoice.id
                });
            }
        }

        return invoice;
    }

    async updateInvoice(id: string, data: any) {
        const updateData: any = {};
        if (data.status) updateData.status = data.status;
        if (data.items) {
            updateData.items = data.items;
            updateData.total = data.items.reduce((sum: number, item: any) =>
                sum + (item.quantity || 1) * (item.unitPrice || item.price || 0), 0
            );
        }
        if (data.total !== undefined) updateData.total = data.total;

        return this.prisma.invoice.update({
            where: { id },
            data: updateData,
            include: {
                client: true,
                project: true,
            },
        });
    }

    async deleteInvoice(id: string) {
        return this.prisma.invoice.delete({ where: { id } });
    }

    async getFinancialStats(user: any) {
        const invoices = await this.prisma.invoice.findMany({
            where: user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN'
                ? { client: { email: user.email } }
                : {},
        });

        const paid = invoices.filter(i => i.status === 'PAID');
        const pending = invoices.filter(i => i.status === 'PENDING' || i.status === 'DRAFT');
        const overdue = invoices.filter(i => i.status === 'OVERDUE');

        return {
            totalRevenue: paid.reduce((sum, i) => sum + i.total, 0),
            pendingRevenue: pending.reduce((sum, i) => sum + i.total, 0),
            overdueAmount: overdue.reduce((sum, i) => sum + i.total, 0),
            invoiceCount: {
                total: invoices.length,
                paid: paid.length,
                pending: pending.length,
                overdue: overdue.length,
            },
        };
    }

    async getRevenueHistory(user: any) {
        // Last 6 months
        const dateLimit = new Date();
        dateLimit.setMonth(dateLimit.getMonth() - 6);

        const invoices = await this.prisma.invoice.findMany({
            where: {
                status: 'PAID',
                createdAt: { gte: dateLimit },
                ...(user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' ? { client: { email: user.email } } : {})
            },
            orderBy: { createdAt: 'asc' }
        });

        const grouped = invoices.reduce((acc: any, invoice) => {
            const month = invoice.createdAt.toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + invoice.total;
            return acc;
        }, {});

        // Ensure all last 6 months are present even if 0
        const result = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = d.toLocaleString('default', { month: 'short' });
            result.push({
                name: monthName,
                amount: grouped[monthName] || 0
            });
        }
        return result;
    }

    async getTimeLogs(projectId?: string) {
        return this.prisma.timeLog.findMany({
            where: projectId ? { projectId } : {},
            include: {
                user: { select: { id: true, name: true, avatar: true } },
                project: { select: { id: true, name: true } },
            },
            orderBy: { date: 'desc' },
            take: 100,
        });
    }

    async createTimeLog(data: any) {
        return this.prisma.timeLog.create({
            data: {
                durationMinutes: data.durationMinutes || Math.round((data.hours || 0) * 60),
                date: new Date(data.date),
                userId: data.userId,
                projectId: data.projectId,
            },
            include: {
                user: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
        });
    }

    findAll() {
        return this.getFinancialStats({ role: 'ADMIN' });
    }

    // ==================== SUPPLIERS ====================

    async getSuppliers() {
        return this.prisma.supplier.findMany({
            include: { bills: true },
            orderBy: { name: 'asc' },
        });
    }

    async getSupplier(id: string) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: { bills: true },
        });
        if (!supplier) throw new NotFoundException('Supplier not found');
        return supplier;
    }

    async createSupplier(data: any) {
        return this.prisma.supplier.create({
            data: {
                name: data.name,
                email: data.email,
                taxId: data.taxId,
                paymentTerms: data.paymentTerms,
                currency: data.currency || 'USD',
            },
        });
    }

    async updateSupplier(id: string, data: any) {
        return this.prisma.supplier.update({
            where: { id },
            data,
        });
    }

    async deleteSupplier(id: string) {
        return this.prisma.supplier.delete({ where: { id } });
    }

    // ==================== BILLS ====================

    async getBills() {
        return this.prisma.bill.findMany({
            include: { supplier: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getBill(id: string) {
        const bill = await this.prisma.bill.findUnique({
            where: { id },
            include: { supplier: true },
        });
        if (!bill) throw new NotFoundException('Bill not found');
        return bill;
    }

    async createBill(data: any) {
        return this.prisma.bill.create({
            data: {
                number: data.number,
                supplierId: data.supplierId,
                status: data.status || 'PENDING',
                amount: data.amount,
                dueDate: new Date(data.dueDate),
                items: data.items,
                notes: data.notes,
            },
            include: { supplier: true },
        });
    }

    async updateBill(id: string, data: any) {
        const updateData: any = {};
        if (data.status) updateData.status = data.status;
        if (data.amount !== undefined) updateData.amount = data.amount;
        if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
        if (data.items) updateData.items = data.items;
        if (data.notes !== undefined) updateData.notes = data.notes;

        return this.prisma.bill.update({
            where: { id },
            data: updateData,
            include: { supplier: true },
        });
    }

    async deleteBill(id: string) {
        return this.prisma.bill.delete({ where: { id } });
    }

    // ==================== FINANCIAL SUMMARY ====================

    async getFinancialSummary() {
        const [invoices, bills] = await Promise.all([
            this.prisma.invoice.findMany(),
            this.prisma.bill.findMany(),
        ]);

        const paidInvoices = invoices.filter(i => i.status === 'PAID');
        const outstandingInvoices = invoices.filter(i => i.status !== 'PAID' && i.status !== 'VOID');
        const pendingBills = bills.filter(b => b.status !== 'PAID');

        return {
            receivables: {
                totalBilled: invoices.reduce((sum, i) => sum + i.total, 0),
                outstanding: outstandingInvoices.reduce((sum, i) => sum + i.total, 0),
                collected: paidInvoices.reduce((sum, i) => sum + i.total, 0),
            },
            payables: {
                totalBilled: bills.reduce((sum, b) => sum + b.amount, 0),
                pending: pendingBills.reduce((sum, b) => sum + b.amount, 0),
            },
            netPosition: paidInvoices.reduce((sum, i) => sum + i.total, 0) -
                bills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + b.amount, 0),
        };
    }
}
