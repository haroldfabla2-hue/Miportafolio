import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CrmModule } from './crm/crm.module';
import { CmsModule } from './cms/cms.module';
import { FinanceModule } from './finance/finance.module';
import { IrisModule } from './iris/iris.module';
import { TasksModule } from './tasks/tasks.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LeadsModule } from './leads/leads.module';
import { TicketsModule } from './tickets/tickets.module';
import { GoogleModule } from './google/google.module';
import { AssetsModule } from './assets/assets.module';
import { PermissionsModule } from './permissions/permissions.module';
import { WorkerRolesModule } from './worker-roles/worker-roles.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { HealthModule } from './health/health.module';
import { OracleModule } from './oracle/oracle.module';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { EventsModule } from './events/events.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100,
        }]),
        PrismaModule,
        AuthModule,
        UsersModule,
        CrmModule,
        CmsModule,
        FinanceModule,
        IrisModule,
        TasksModule,
        ChatModule,
        NotificationsModule,
        LeadsModule,
        TicketsModule,
        GoogleModule,
        AssetsModule,
        PermissionsModule,
        WorkerRolesModule,
        AuditLogsModule,
        HealthModule,
        OracleModule,
        EventsModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditInterceptor,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RequestLoggerMiddleware)
            .forRoutes('*');
    }
}

