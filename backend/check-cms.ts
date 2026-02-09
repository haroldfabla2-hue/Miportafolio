import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking CMS Content...');
    try {
        const portfolioCount = await prisma.cmsContent.count({
            where: { type: 'PORTFOLIO' }
        });
        console.log(`Total PORTFOLIO items in CMS: ${portfolioCount}`);

        if (portfolioCount > 0) {
            const items = await prisma.cmsContent.findMany({
                where: { type: 'PORTFOLIO' },
                take: 3
            });
            console.log('Sample portfolio items:', JSON.stringify(items, null, 2));
        } else {
            console.log('No PORTFOLIO items found. You might need to seed CMS content.');
        }

        const blogCount = await prisma.cmsContent.count({
            where: { type: 'BLOG' }
        });
        console.log(`Total BLOG items in CMS: ${blogCount}`);

    } catch (e) {
        console.error('Error connecting to DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
