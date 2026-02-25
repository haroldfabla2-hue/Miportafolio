import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { GoogleModule } from '../google/google.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { PermissionGuard } from '../guards/permission.guard';

@Module({
    imports: [GoogleModule, PermissionsModule],
    controllers: [LeadsController],
    providers: [LeadsService, PermissionGuard],
    exports: [LeadsService],
})
export class LeadsModule { }
