import { Controller, Get, Post, Body, Put, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
// import { AuthGuard } from '../../auth/auth.guard'; // TODO: Implement AuthGuard

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('crm/clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Get()
    @ApiOperation({ summary: 'List all clients' })
    findAll(@Request() req: any) {
        // Mock user for now until AuthGuard is ready
        const user = req.user || { role: 'ADMIN', id: 'mock-admin-id' };
        return this.clientsService.findAll(user);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a client by ID' })
    findOne(@Param('id') id: string) {
        return this.clientsService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new client' })
    create(@Body() createClientDto: any) {
        return this.clientsService.create(createClientDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a client' })
    update(@Param('id') id: string, @Body() updateClientDto: any) {
        return this.clientsService.update(id, updateClientDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a client' })
    remove(@Param('id') id: string) {
        return this.clientsService.remove(id);
    }
}
