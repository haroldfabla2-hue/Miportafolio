import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionGuard } from '../../guards/permission.guard';
import { RequiresPermission } from '../../decorators/requires-permission.decorator';
import { UseGuards } from '@nestjs/common';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('crm/projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Get()
    @RequiresPermission('projects:view')
    @ApiOperation({ summary: 'List all projects' })
    findAll(@Req() req: any) {
        const user = req.user;
        return this.projectsService.findAll(user);
    }

    @Get('active')
    @RequiresPermission('projects:view')
    @ApiOperation({ summary: 'Get Active Projects for Dashboard' })
    findActive(@Req() req: any) {
        return this.projectsService.findActive(req.user);
    }

    @Get(':id')
    @RequiresPermission('projects:view')
    @ApiOperation({ summary: 'Get a project by ID' })
    findOne(@Param('id') id: string, @Req() req: any) {
        return this.projectsService.findOne(id, req.user);
    }

    @Post()
    @RequiresPermission('projects:create')
    @ApiOperation({ summary: 'Create a new project' })
    // @ApiBody({ type: CreateProjectDto }) // Need to define DTO
    create(@Body() data: any) {
        return this.projectsService.create(data);
    }

    @Put(':id')
    @RequiresPermission('projects:edit')
    @ApiOperation({ summary: 'Update a project' })
    update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
        return this.projectsService.update(id, data, req.user);
    }

    @Delete(':id')
    @RequiresPermission('projects:delete')
    @ApiOperation({ summary: 'Delete a project' })
    remove(@Param('id') id: string, @Req() req: any) {
        return this.projectsService.remove(id, req.user);
    }
}
