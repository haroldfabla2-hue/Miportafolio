import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get('PORT') || 3001;

    // Validate critical environment variables
    const requiredVars = ['JWT_SECRET', 'DATABASE_URL'];
    const missingVars = requiredVars.filter(v => !configService.get(v));

    if (missingVars.length > 0) {
        console.error(`❌ FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
        console.error('   Please set these in your .env file before starting the server.');
        process.exit(1);
    }

    // Warn about optional but recommended vars
    const recommendedVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'FRONTEND_URL'];
    const missingRecommended = recommendedVars.filter(v => !configService.get(v));
    if (missingRecommended.length > 0) {
        console.warn(`⚠️  WARNING: Missing recommended environment variables: ${missingRecommended.join(', ')}`);
        console.warn('   Some features may not work correctly.');
    }

    // Enable Global Validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    // Global Exception Filter
    app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

    // Enable CORS with production-ready configuration
    const frontendUrl = configService.get('FRONTEND_URL') || 'http://localhost:5173';
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? [frontendUrl]  // Restrict to specific frontend URL in production
            : true,          // Allow all origins in development
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // Global Prefix
    app.setGlobalPrefix('api');

    // WebSocket Adapter (Redis)
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);

    // Swagger Configuration
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Silhouette CRM API')
        .setDescription('Enterprise CRM Backend API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger Docs available at: http://localhost:${port}/api/docs`);
}

process.on('uncaughtException', (err) => {
    console.error('FATAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

bootstrap();
