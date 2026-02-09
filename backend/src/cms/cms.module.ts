import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
    imports: [PermissionsModule],
    controllers: [CmsController],
    providers: [CmsService],
})
export class CmsModule { }
