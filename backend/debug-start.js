const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'startup_error.log');

function logToFile(message) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, line);
}

async function bootstrap() {
    try {
        logToFile('Attempting to create Nest application...');
        console.log('Attempting to create Nest application...');

        const app = await NestFactory.create(AppModule, {
            logger: ['error', 'warn', 'log', 'debug', 'verbose'],
            abortOnError: false
        });

        logToFile('Nest application created successfully.');
        console.log('Nest application created successfully.');

        await app.listen(3001);
        logToFile('Application is listening on port 3001');
        console.log('Application is listening on port 3001');
    } catch (error) {
        const msg = `FATAL ERROR during bootstrap: ${error.message}\nStack: ${error.stack}`;
        console.error(msg);
        logToFile(msg);
    }
}

// Clear previous log
if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE);
}

bootstrap();
