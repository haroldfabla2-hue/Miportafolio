import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { PdfService } from './pdf.service';

@Module({
    controllers: [FinanceController],
    providers: [FinanceService, PdfService],
    exports: [FinanceService, PdfService],
})
export class FinanceModule { }

