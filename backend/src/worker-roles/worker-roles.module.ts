import { Module } from '@nestjs/common';
import { WorkerRolesService } from './worker-roles.service';
import { WorkerRolesController } from './worker-roles.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { PermissionGuard } from '../guards/permission.guard';

@Module({
    imports: [PermissionsModule],
    controllers: [WorkerRolesController],
    providers: [WorkerRolesService, PrismaService, PermissionGuard],
    exports: [WorkerRolesService],
})
export class WorkerRolesModule { }
