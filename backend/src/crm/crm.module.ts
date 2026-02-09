import { Module } from '@nestjs/common';
import { ProjectsController } from './projects/projects.controller';
import { ProjectsService } from './projects/projects.service';
import { ClientsController } from './clients/clients.controller';
import { ClientsService } from './clients/clients.service';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';

@Module({
    controllers: [ProjectsController, ClientsController, CrmController],
    providers: [ProjectsService, ClientsService, CrmService],
})
export class CrmModule { }
