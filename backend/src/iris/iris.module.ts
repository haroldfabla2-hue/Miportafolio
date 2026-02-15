import { Module } from '@nestjs/common';
import { IrisService } from './iris.service';
import { IrisController } from './iris.controller';
import { KimiService } from './kimi.service';
import { MinimaxService } from './minimax.service';
import { GeminiService } from './gemini.service';
import { ToolsService } from './tools.service';
import { TasksModule } from '../tasks/tasks.module';
import { CrmModule } from '../crm/crm.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule, TasksModule, CrmModule],
    controllers: [IrisController],
    providers: [IrisService, KimiService, MinimaxService, GeminiService, ToolsService],
    exports: [IrisService, KimiService, MinimaxService, GeminiService, ToolsService],
})
export class IrisModule { }

