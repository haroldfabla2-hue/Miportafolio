
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
    try {
        console.log('[Startup Probe] Initializing NestJS application context...');
        const app = await NestFactory.createApplicationContext(AppModule, {
            logger: ['error', 'warn', 'log'],
        });
        console.log('[Startup Probe] Application context created successfully.');

        // Check key services
        const tasksService = app.get('TasksService'); // Check if TasksService is resolvable
        if (tasksService) console.log('[Startup Probe] TasksService resolved.');

        console.log('[Startup Probe] Closing application...');
        await app.close();
        console.log('[Startup Probe] Success!');
        process.exit(0);
    } catch (error) {
        console.error('[Startup Probe] FATAL ERROR:', error);
        process.exit(1);
    }
}

bootstrap();
