import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CmsSeedService } from './cms/cms.seed.service';

async function bootstrap() {
    console.log('Bootstrapping NestJS application context for seeding...');
    const app = await NestFactory.createApplicationContext(AppModule);
    
    const seedService = app.get(CmsSeedService);
    
    try {
        await seedService.runSeed();
        console.log('Seed execution completed.');
    } catch (error) {
        console.error('Seed execution failed:', error);
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
