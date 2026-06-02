import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { IrisModule } from '../iris/iris.module';
import { CmsSeedService } from './cms.seed.service';

@Module({
    imports: [PermissionsModule, IrisModule],
    controllers: [CmsController, ReportsController],
    providers: [CmsService, ReportsService, CmsSeedService],
    exports: [CmsService, ReportsService, CmsSeedService],
})
export class CmsModule { }
