import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
// import { AuthGuard } from '../../auth/auth.guard'; 

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('crm/projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Get()
    @ApiOperation({ summary: 'List all projects' })
    findAll(@Req() req: any) {
        const user = req.user;
        return this.projectsService.findAll(user);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a project by ID' })
    findOne(@Param('id') id: string) {
        return this.projectsService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new project' })
    // @ApiBody({ type: CreateProjectDto }) // Need to define DTO
    create(@Body() data: any) {
        return this.projectsService.create(data);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a project' })
    update(@Param('id') id: string, @Body() data: any) {
        return this.projectsService.update(id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a project' })
    remove(@Param('id') id: string) {
        return this.projectsService.remove(id);
    }
}

