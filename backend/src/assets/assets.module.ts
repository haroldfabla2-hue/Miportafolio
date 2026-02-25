import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GoogleModule } from '../google/google.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { PermissionGuard } from '../guards/permission.guard';

@Module({
    imports: [PrismaModule, GoogleModule, PermissionsModule],
    controllers: [AssetsController],
    providers: [AssetsService, PermissionGuard],
    exports: [AssetsService],
})
export class AssetsModule { }
