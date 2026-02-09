import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { GoogleModule } from '../google/google.module';

import { OnboardingController } from './onboarding.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule, GoogleModule],
    controllers: [UsersController, OnboardingController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
