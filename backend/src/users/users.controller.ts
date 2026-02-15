import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll(@Req() req: any) {
        const user = req.user;
        return this.usersService.findAll(user);
    }

    @Get('stats')
    getStats() {
        return this.usersService.getStats();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Post('invite')
    invite(@Req() req: any, @Body() data: { name: string; email: string; role?: string }) {
        const inviterId = req.user.id;
        return this.usersService.inviteUser(inviterId, data);
    }

    @Post()
    create(@Body() data: any) {
        return this.usersService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.usersService.update(id, data);
    }

    @Post('onboarding/complete')
    completeOnboarding(@Req() req: any, @Body() data: { phone?: string; jobTitle?: string; profileDetails?: any }) {
        return this.usersService.completeOnboarding(req.user.id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
