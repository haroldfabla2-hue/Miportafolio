import { Module } from '@nestjs/common';
import { PaypalController } from './paypal.controller';
import { PaypalService } from './paypal.service';
import { FinanceModule } from '../finance/finance.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [FinanceModule, NotificationsModule],
    controllers: [PaypalController],
    providers: [PaypalService],
})
export class PaymentsModule {}
