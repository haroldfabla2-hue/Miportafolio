
import { Module } from '@nestjs/common';
import { OracleService } from './oracle.service';
import { OracleController } from './oracle.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { IrisModule } from '../iris/iris.module';

@Module({
    imports: [PrismaModule, IrisModule],
    controllers: [OracleController],
    providers: [OracleService],
    exports: [OracleService]
})
export class OracleModule { }
