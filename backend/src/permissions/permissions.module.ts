import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionGuard } from '../guards/permission.guard';

@Module({
    controllers: [PermissionsController],
    providers: [PermissionsService, PrismaService, PermissionGuard],
    exports: [PermissionsService],
})
export class PermissionsModule { }
