import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { PermissionGuard } from '../guards/permission.guard';

@Module({
    imports: [PermissionsModule],
    controllers: [TicketsController],
    providers: [TicketsService, PermissionGuard],
    exports: [TicketsService],
})
export class TicketsModule { }
