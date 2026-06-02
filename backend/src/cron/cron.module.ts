import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { FinanceModule } from '../finance/finance.module';

@Module({
    imports: [FinanceModule],
    providers: [CronService],
})
export class CronModule {}
