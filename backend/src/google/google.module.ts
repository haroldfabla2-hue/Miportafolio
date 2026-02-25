import { Module, forwardRef } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GmailService } from './gmail.service';
import { GoogleDriveService } from './google-drive.service';
import { GmailController } from './gmail.controller';
import { DriveController } from './drive.controller';
import { GoogleController } from './google.controller';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PermissionsModule } from '../permissions/permissions.module';
import { PermissionGuard } from '../guards/permission.guard';

@Module({
    imports: [forwardRef(() => UsersModule), ConfigModule, PermissionsModule],
    providers: [GoogleService, GmailService, GoogleDriveService, PermissionGuard],
    controllers: [GmailController, DriveController, GoogleController],
    exports: [GoogleService, GmailService, GoogleDriveService],
})
export class GoogleModule { }
