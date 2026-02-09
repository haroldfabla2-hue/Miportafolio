import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking CMS Content URLs...\n');
    try {
        const items = await prisma.cmsContent.findMany({
            where: { type: 'PORTFOLIO' },
            select: {
                title: true,
                slug: true,
                coverImage: true,
                metadata: true,
            }
        });

        console.log('Portfolio items with metadata:');
        items.forEach((item, i) => {
            console.log(`\n${i + 1}. ${item.title}`);
            console.log(`   Slug: ${item.slug}`);
            console.log(`   Cover Image: ${item.coverImage}`);
            console.log(`   Metadata type: ${typeof item.metadata}`);
            console.log(`   Metadata: ${JSON.stringify(item.metadata, null, 2)}`);
            if (item.metadata && typeof item.metadata === 'object') {
                const meta = item.metadata as any;
                console.log(`   URL from metadata: ${meta.url || 'NOT FOUND'}`);
            }
        });
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
