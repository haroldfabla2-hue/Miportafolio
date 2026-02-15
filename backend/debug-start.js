
const { nest } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');

async function bootstrap() {
    try {
        console.log('Attempting to create Nest application...');
        const app = await nest.NestFactory.create(AppModule, { logger: ['error', 'warn', 'log', 'debug', 'verbose'] });
        console.log('Nest application created successfully.');

        await app.listen(3001);
        console.log('Application is listening on port 3001');
    } catch (error) {
        console.error('FATAL ERROR during bootstrap:', error);
        if (error.stack) console.error(error.stack);
    }
}

bootstrap();
