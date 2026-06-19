import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PdfService } from './pdf.service';
import { GmailService } from '../google/gmail.service';
import { GoogleDriveService } from '../google/google-drive.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FinanceService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
        private pdfService: PdfService,
        private gmailService: GmailService,
        private googleDriveService: GoogleDriveService
    ) { }


    private isAdmin(user: any): boolean {
        return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    }

    async getInvoices(user: any) {
        let whereClause: any = {};

        if (user.role === 'CLIENT') {
            const client = await this.prisma.client.findFirst({
                where: { email: user.email },
            });
            if (client) {
                whereClause = { clientId: client.id };
            } else {
                whereClause = { id: '__forbidden__' };
            }
        } else if (user.role === 'WORKER') {
            whereClause = {
                OR: [
                    { project: { managerId: user.id } },
                    { project: { team: { some: { id: user.id } } } },
                ],
            };
        } else if (!this.isAdmin(user)) {
            whereClause = { id: '__forbidden__' };
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

    async getInvoice(id: string, user: any) {
        let accessWhere: any = {};

        if (user.role === 'CLIENT') {
            accessWhere = { client: { email: user.email } };
        } else if (user.role === 'WORKER') {
            accessWhere = {
                OR: [
                    { project: { managerId: user.id } },
                    { project: { team: { some: { id: user.id } } } },
                ],
            };
        } else if (!this.isAdmin(user)) {
            accessWhere = { id: '__forbidden__' };
        }

        const invoice = await this.prisma.invoice.findFirst({
            where: {
                id,
                ...accessWhere,
            },
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
        const where =
            this.isAdmin(user)
                ? {}
                : user.role === 'CLIENT'
                    ? { client: { email: user.email } }
                    : user.role === 'WORKER'
                        ? {
                            OR: [
                                { project: { managerId: user.id } },
                                { project: { team: { some: { id: user.id } } } },
                            ],
                        }
                        : { id: '__forbidden__' };

        const invoices = await this.prisma.invoice.findMany({
            where,
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

        const accessFilter =
            this.isAdmin(user)
                ? {}
                : user.role === 'CLIENT'
                    ? { client: { email: user.email } }
                    : user.role === 'WORKER'
                        ? {
                            OR: [
                                { project: { managerId: user.id } },
                                { project: { team: { some: { id: user.id } } } },
                            ],
                        }
                        : { id: '__forbidden__' };

        const invoices = await this.prisma.invoice.findMany({
            where: {
                status: 'PAID',
                createdAt: { gte: dateLimit },
                ...accessFilter,
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

    async getTimeLogs(user: any, projectId?: string) {
        const where: any = {};

        if (projectId) {
            where.projectId = projectId;
        }

        if (!this.isAdmin(user)) {
            if (user.role === 'CLIENT') {
                where.project = { client: { email: user.email } };
            } else if (user.role === 'WORKER') {
                where.OR = [
                    { userId: user.id },
                    { project: { managerId: user.id } },
                    { project: { team: { some: { id: user.id } } } },
                ];
            } else {
                return [];
            }
        }

        return this.prisma.timeLog.findMany({
            where,
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
                total: data.amount, // Mapped from input amount
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
        if (data.amount !== undefined) updateData.total = data.amount;
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

    async getFinancialSummary(user: any) {
        const invoiceWhere = this.isAdmin(user)
            ? {}
            : { client: { email: user.email } };

        const invoices = await this.prisma.invoice.findMany({ where: invoiceWhere });

        if (!this.isAdmin(user)) {
            const paidInvoices = invoices.filter(i => i.status === 'PAID');
            const outstandingInvoices = invoices.filter(i => i.status !== 'PAID' && i.status !== 'VOID');

            return {
                receivables: {
                    totalBilled: invoices.reduce((sum, i) => sum + i.total, 0),
                    outstanding: outstandingInvoices.reduce((sum, i) => sum + i.total, 0),
                    collected: paidInvoices.reduce((sum, i) => sum + i.total, 0),
                },
                payables: {
                    totalBilled: 0,
                    pending: 0,
                },
                netPosition: paidInvoices.reduce((sum, i) => sum + i.total, 0),
            };
        }

        const bills = await this.prisma.bill.findMany();

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
                totalBilled: bills.reduce((sum, b) => sum + b.total, 0),
                pending: pendingBills.reduce((sum, b) => sum + b.total, 0),
            },
            netPosition: paidInvoices.reduce((sum, i) => sum + i.total, 0) -
                bills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + b.total, 0),
        };
    }

    async generateContractPdf(data: any, user: any) {
        // 1. Generate HTML
        const html = this.pdfService.getContractTemplate(data);

        // 2. Generate PDF Buffer
        const pdfBuffer = await this.pdfService.generatePdf(html);

        // 3. Create Asset record in DB
        let projectId = null;
        if (data.clientCompany) {
            const project = await this.prisma.project.findFirst({
                where: { client: { company: data.clientCompany } }
            });
            if (project) {
                projectId = project.id;
            }
        }

        const assetName = `CONTRATO_${data.clientCompany.replace(/\s+/g, '_')}_${data.planCode}`;
        const asset = await this.prisma.asset.create({
            data: {
                name: assetName,
                url: '#', // updated below
                type: 'document',
                status: 'DRAFT',
                uploadedBy: user.id,
                projectId: projectId
            }
        });

        // Log contract generation in the audit trail
        try {
            await this.prisma.auditLog.create({
                data: {
                    action: 'GENERATE_CONTRACT',
                    userId: user.id,
                    details: {
                        clientCompany: data.clientCompany,
                        planCode: data.planCode,
                        price: data.price,
                        currency: data.currency,
                        assetId: asset.id
                    }
                }
            });
        } catch (auditError) {
            console.error('Failed to write contract generation audit log:', auditError.message);
        }


        // 4. Save PDF to disk
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'contracts');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, `${asset.id}.pdf`);
        fs.writeFileSync(filePath, pdfBuffer);

        // 5. Build download link URL
        let downloadUrl = `/api/finance/contracts/download/${asset.id}`;

        // 6. Optional: Upload to Google Drive if user is connected
        let driveId = null;
        let thumbnailUrl = null;
        if (user.googleConnected || user.googleAccessToken) {
            try {
                const driveData = await this.googleDriveService.uploadFile(
                    user.id,
                    `${assetName}.pdf`,
                    'application/pdf',
                    pdfBuffer
                );
                if (driveData) {
                    downloadUrl = driveData.webViewLink;
                    driveId = driveData.id;
                    thumbnailUrl = driveData.thumbnailLink;
                }
            } catch (error) {
                console.warn('Google Drive upload failed, using local download URL:', error.message);
            }
        }

        // Update asset with actual URL & driveId
        const updatedAsset = await this.prisma.asset.update({
            where: { id: asset.id },
            data: {
                url: downloadUrl,
                driveId: driveId,
                thumbnailUrl: thumbnailUrl,
                status: 'ACTIVE'
            }
        });

        return { pdfUrl: updatedAsset.url };
    }

    async sendContractEmail(data: any, user: any) {
        const subject = `Propuesta Comercial y Contrato de Servicios - ${data.companyName}`;
        const body = `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #111; border-bottom: 2px solid #A3FF00; padding-bottom: 10px;">Propuesta y Contrato de Servicios Tecnológicos</h2>
                <p>Estimado(a) <strong>${data.clientName}</strong>,</p>
                <p>Es un placer saludarle de parte del equipo de ingeniería. En seguimiento a nuestras conversaciones y el análisis de sus necesidades operativas, hemos formalizado la propuesta técnica y el acuerdo de servicios correspondiente para <strong>${data.companyName}</strong>.</p>
                
                <p>Nuestras soluciones integran y licencian de forma nativa los motores propietarios <strong>Silhouette OS</strong> y <strong>CausalOS-Python</strong>, proporcionando una base robusta, segura y de alto rendimiento que servirá de infraestructura para su proyecto.</p>

                <p>Puede descargar el documento del Contrato Marco y el Anexo Técnico (SOW) detallado haciendo clic en el siguiente enlace:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.pdfUrl}" style="background-color: #111; color: #A3FF00; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; border: 1px solid #A3FF00; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        DESCARGAR CONTRATO Y PROPUESTA (PDF)
                    </a>
                </div>

                <p style="font-size: 0.9rem; color: #666;">Nota: Si tiene problemas con el botón, puede copiar y pegar el siguiente enlace en su navegador: <br/> ${data.pdfUrl}</p>

                <p>Por favor, revise los términos, alcances y el cronograma de hitos. Una vez conforme, puede firmar digitalmente o hacernos llegar el documento rubricado para dar inicio inmediato a la fase de planificación y despliegue del proyecto.</p>

                <p>Quedamos a su entera disposición para cualquier aclaración o ajuste técnico.</p>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="margin: 0;">Atentamente,</p>
                <p style="margin: 5px 0 0 0; font-weight: bold; color: #111;">Alberto Farah Blair</p>
                <p style="margin: 0; font-size: 0.9rem; color: #666;">AI & Automation Architect</p>
            </div>
        `;

        await this.gmailService.sendEmail(user.id, {
            to: data.to,
            subject: subject,
            body: body,
            isHtml: true
        });

        // Log contract email send in the audit trail
        try {
            await this.prisma.auditLog.create({
                data: {
                    action: 'SEND_CONTRACT_EMAIL',
                    userId: user.id,
                    details: {
                        recipient: data.to,
                        clientName: data.clientName,
                        companyName: data.companyName,
                        pdfUrl: data.pdfUrl
                    }
                }
            });
        } catch (auditError) {
            console.error('Failed to write contract email send audit log:', auditError.message);
        }


        return { success: true };
    }

    async downloadContractFile(id: string) {
        const asset = await this.prisma.asset.findUnique({
            where: { id }
        });
        if (!asset) {
            throw new NotFoundException('Contract asset not found');
        }

        const filePath = path.join(__dirname, '..', '..', 'uploads', 'contracts', `${id}.pdf`);
        if (!fs.existsSync(filePath)) {
            throw new NotFoundException('Physical contract PDF file not found');
        }

        const buffer = fs.readFileSync(filePath);
        return {
            buffer,
            fileName: `${asset.name}.pdf`
        };
    }
}

