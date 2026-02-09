import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking database connection...');
    try {
        const count = await prisma.project.count();
        console.log(`Total projects in DB: ${count}`);

        if (count > 0) {
            const projects = await prisma.project.findMany({ take: 3 });
            console.log('Sample projects:', JSON.stringify(projects, null, 2));
        } else {
            console.log('No projects found. Seed might have failed or not run.');
        }
    } catch (e) {
        console.error('Error connecting to DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
