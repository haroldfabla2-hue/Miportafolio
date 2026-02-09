import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Correct URLs from the original data/projects.ts file
const urlFixes = [
    { slug: 'nuestras-casas', correctUrl: 'https://nuestrascasasaqp.com/' },
    { slug: 'bijou-me', correctUrl: 'https://bijoume.shop/' },
    { slug: 'bssn-usa', correctUrl: 'https://bssnusa.com/' },
];

async function main() {
    console.log('🔧 Fixing CMS Content URLs...\n');

    for (const fix of urlFixes) {
        const item = await prisma.cmsContent.findUnique({
            where: { slug: fix.slug },
            select: { id: true, metadata: true, title: true }
        });

        if (item && item.metadata) {
            const oldMetadata = item.metadata as any;
            const newMetadata = { ...oldMetadata, url: fix.correctUrl };

            await prisma.cmsContent.update({
                where: { slug: fix.slug },
                data: { metadata: newMetadata }
            });

            console.log(`✅ ${item.title}: ${oldMetadata.url} → ${fix.correctUrl}`);
        } else {
            console.log(`⚠️ ${fix.slug} not found or no metadata`);
        }
    }

    console.log('\n🎉 URLs fixed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Fix failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
