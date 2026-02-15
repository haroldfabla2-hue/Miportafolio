import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { IrisModule } from '../iris/iris.module';

@Module({
    imports: [PermissionsModule, IrisModule],
    controllers: [CmsController, ReportsController],
    providers: [CmsService, ReportsService],
    exports: [CmsService, ReportsService],
})
export class CmsModule { }
