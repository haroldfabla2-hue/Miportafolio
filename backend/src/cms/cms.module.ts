import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { IrisModule } from '../iris/iris.module';
import { CmsSeedService } from './cms.seed.service';
import { SeoService } from './seo.service';
import { SeoController } from './seo.controller';
import { CmsSettingsService } from './cms-settings.service';
import { CmsSettingsController } from './cms-settings.controller';

@Module({
    imports: [PermissionsModule, IrisModule],
    controllers: [CmsController, ReportsController, SeoController, CmsSettingsController],
    providers: [CmsService, ReportsService, CmsSeedService, SeoService, CmsSettingsService],
    exports: [CmsService, ReportsService, CmsSeedService, SeoService, CmsSettingsService],
})
export class CmsModule { }

