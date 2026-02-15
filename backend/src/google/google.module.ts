import { Module, forwardRef } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GmailService } from './gmail.service';
import { GoogleDriveService } from './google-drive.service';
import { GmailController } from './gmail.controller';
import { DriveController } from './drive.controller';
import { GoogleController } from './google.controller';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [forwardRef(() => UsersModule), ConfigModule],
    providers: [GoogleService, GmailService, GoogleDriveService],
    controllers: [GmailController, DriveController, GoogleController],
    exports: [GoogleService, GmailService, GoogleDriveService],
})
export class GoogleModule { }
