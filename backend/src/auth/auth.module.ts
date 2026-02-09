import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { TotpService } from './totp.service';
import { EncryptionService } from './encryption.service';
import { TokenService } from './token.service';
import { InvitationService } from './invitation.service';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
    imports: [UsersModule, ConfigModule, PermissionsModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        TotpService,
        EncryptionService,
        TokenService,
        InvitationService,
    ],
    exports: [
        AuthService,
        TotpService,
        EncryptionService,
        TokenService,
        InvitationService,
    ],
})
export class AuthModule { }

