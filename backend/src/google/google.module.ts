import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GmailController } from './gmail.controller';
import { DriveController } from './drive.controller';
import { GoogleController } from './google.controller';
import { UsersModule } from '../users/users.module'; // To access user tokens
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [UsersModule, ConfigModule],
    providers: [GoogleService],
    controllers: [GmailController, DriveController, GoogleController],
    exports: [GoogleService],
})
export class GoogleModule { }
