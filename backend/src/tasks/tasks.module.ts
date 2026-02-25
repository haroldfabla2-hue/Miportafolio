import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { PermissionGuard } from '../guards/permission.guard';

@Module({
    imports: [NotificationsModule, PermissionsModule],
    controllers: [TasksController],
    providers: [TasksService, PermissionGuard],
    exports: [TasksService],
})
export class TasksModule { }
