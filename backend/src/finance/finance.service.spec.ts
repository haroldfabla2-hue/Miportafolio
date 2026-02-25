import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const mockPrismaService = {
    invoice: {
        aggregate: jest.fn(),
        groupBy: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
    },
    bill: {
        aggregate: jest.fn(),
        findMany: jest.fn(),
    }
};

const mockNotificationsService = {
    notifyUser: jest.fn(),
    notifyRole: jest.fn(),
};

describe('FinanceService', () => {
    let service: FinanceService;
    let prisma: typeof mockPrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FinanceService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: NotificationsService, useValue: mockNotificationsService },
            ],
        }).compile();

        service = module.get<FinanceService>(FinanceService);
        prisma = module.get(PrismaService); // typed as any/mock
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getFinancialSummary', () => {
        it('should return aggregated stats', async () => {
            // Mock findMany responses
            mockPrismaService.invoice.findMany.mockResolvedValue([
                { status: 'PAID', total: 8000 },
                { status: 'PENDING', total: 2000 }
            ]);
            mockPrismaService.bill.findMany.mockResolvedValue([
                { status: 'PENDING', amount: 5000 },
                { status: 'PAID', amount: 1000 }
            ]);

            const stats = await service.getFinancialSummary({ role: 'ADMIN' });

            expect(stats.receivables.totalBilled).toBe(10000); // 8000 + 2000
            expect(stats.receivables.collected).toBe(8000);
            expect(stats.payables.totalBilled).toBe(6000); // 5000 + 1000
            expect(stats.payables.pending).toBe(5000);
            expect(prisma.invoice.findMany).toHaveBeenCalled();
        });

        it('should return zeros if no data', async () => {
            mockPrismaService.invoice.findMany.mockResolvedValue([]);
            mockPrismaService.bill.findMany.mockResolvedValue([]);

            const stats = await service.getFinancialSummary({ role: 'ADMIN' });

            expect(stats.receivables.totalBilled).toBe(0);
        });
    });
});
