import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { GoogleModule } from '../google/google.module';

import { OnboardingController } from './onboarding.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { PermissionGuard } from '../guards/permission.guard';

@Module({
    imports: [PrismaModule, forwardRef(() => GoogleModule), PermissionsModule],
    controllers: [UsersController, OnboardingController],
    providers: [UsersService, PermissionGuard],
    exports: [UsersService],
})
export class UsersModule { }
