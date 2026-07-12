import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { GoogleModule } from '../google/google.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { PermissionGuard } from '../guards/permission.guard';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [GoogleModule, PermissionsModule, EmailModule],
    controllers: [LeadsController],
    providers: [LeadsService, PermissionGuard],
    exports: [LeadsService],
})
export class LeadsModule { }
