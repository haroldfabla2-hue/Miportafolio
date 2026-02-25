import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequiresPermission } from '../decorators/requires-permission.decorator';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @RequiresPermission('team:view')
    findAll(@Req() req: any) {
        const user = req.user;
        return this.usersService.findAll(user);
    }

    @Get('stats')
    @RequiresPermission('team:view')
    getStats(@Req() req: any) {
        return this.usersService.getStats(req.user);
    }

    @Get(':id')
    @RequiresPermission('team:view')
    findOne(@Param('id') id: string, @Req() req: any) {
        return this.usersService.findById(id, req.user);
    }

    @Post('invite')
    @RequiresPermission('team:manage')
    invite(@Req() req: any, @Body() data: { name: string; email: string; role?: string }) {
        const inviterId = req.user.id;
        return this.usersService.inviteUser(inviterId, data);
    }

    @Post()
    @RequiresPermission('team:manage')
    create(@Body() data: any) {
        return this.usersService.create(data);
    }

    @Put(':id')
    @RequiresPermission('team:manage')
    update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
        return this.usersService.update(id, data, req.user);
    }

    @Post('onboarding/complete')
    @RequiresPermission('dashboard:view')
    completeOnboarding(@Req() req: any, @Body() data: { phone?: string; jobTitle?: string; profileDetails?: any }) {
        return this.usersService.completeOnboarding(req.user.id, data);
    }

    @Delete(':id')
    @RequiresPermission('team:manage')
    remove(@Param('id') id: string, @Req() req: any) {
        return this.usersService.remove(id, req.user);
    }
}
