import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users/onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
    constructor(private readonly usersService: UsersService) { }

    @Post('complete')
    async completeOnboarding(@Request() req, @Body() body: any) {
        return this.usersService.completeOnboarding(req.user.id, body);
    }
}
