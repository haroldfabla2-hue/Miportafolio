import { Controller, Get, Post, Body, Put, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionGuard } from '../../guards/permission.guard';
import { RequiresPermission } from '../../decorators/requires-permission.decorator';
import { UseGuards } from '@nestjs/common';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('crm/clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Get()
    @RequiresPermission('clients:view')
    @ApiOperation({ summary: 'List all clients' })
    findAll(@Request() req: any) {
        return this.clientsService.findAll(req.user);
    }

    @Get(':id')
    @RequiresPermission('clients:view')
    @ApiOperation({ summary: 'Get a client by ID' })
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.clientsService.findOne(id, req.user);
    }

    @Post()
    @RequiresPermission('clients:manage')
    @ApiOperation({ summary: 'Create a new client' })
    create(@Body() createClientDto: any) {
        return this.clientsService.create(createClientDto);
    }

    @Put(':id')
    @RequiresPermission('clients:manage')
    @ApiOperation({ summary: 'Update a client' })
    update(@Param('id') id: string, @Body() updateClientDto: any, @Request() req: any) {
        return this.clientsService.update(id, updateClientDto, req.user);
    }

    @Delete(':id')
    @RequiresPermission('clients:manage')
    @ApiOperation({ summary: 'Delete a client' })
    remove(@Param('id') id: string, @Request() req: any) {
        return this.clientsService.remove(id, req.user);
    }
}
