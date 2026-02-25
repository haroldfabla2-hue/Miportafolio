import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { PdfService } from './pdf.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { PermissionGuard } from '../guards/permission.guard';

@Module({
    imports: [PermissionsModule],
    controllers: [FinanceController],
    providers: [FinanceService, PdfService, PermissionGuard],
    exports: [FinanceService, PdfService],
})
export class FinanceModule { }
