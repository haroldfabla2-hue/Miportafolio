import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding CMS Content (Portfolio)...\n');

    // 1. Nuestras Casas
    await prisma.cmsContent.upsert({
        where: { slug: 'nuestras-casas' },
        update: {},
        create: {
            slug: 'nuestras-casas',
            type: 'PORTFOLIO',
            title: 'Nuestras Casas',
            content: 'A modern real estate platform designed to showcase premium properties in Arequipa. The interface focuses on high-quality imagery and seamless navigation to enhance the user\'s journey from discovery to contact.',
            metaTitle: 'Nuestras Casas - Luxury Real Estate',
            metaDesc: 'Premium real estate website development.',
            tags: ['Architecture', 'Real Estate', 'Web Design'],
            metadata: {
                year: '2024',
                url: 'https://nuestrascasasaqp.com/',
                role: 'Lead Designer & Developer',
                services: ['UX/UI Design', 'Frontend Development']
            },
            coverImage: '/projects/project-1.png',
            status: 'PUBLISHED',
            publishedAt: new Date()
        }
    });

    // 2. Bijou Me
    await prisma.cmsContent.upsert({
        where: { slug: 'bijou-me' },
        update: {},
        create: {
            slug: 'bijou-me',
            type: 'PORTFOLIO',
            title: 'Bijou Me',
            content: 'An e-commerce destination for exclusive jewelry. The site features a sophisticated shopping experience with dynamic product showcases and a seamless checkout process.',
            metaTitle: 'Bijou Me - Handcrafted Jewelry',
            metaDesc: 'E-commerce solution for jewelry brand.',
            tags: ['E-commerce', 'Brand Identity', 'Development'],
            metadata: {
                year: '2025',
                url: 'https://bijoume.shop/',
                role: 'UI/UX Designer',
                services: ['E-commerce', 'Visual Identity']
            },
            coverImage: '/projects/project-3.png',
            status: 'PUBLISHED',
            publishedAt: new Date()
        }
    });

    // 3. BSSN USA
    await prisma.cmsContent.upsert({
        where: { slug: 'bssn-usa' },
        update: {},
        create: {
            slug: 'bssn-usa',
            type: 'PORTFOLIO',
            title: 'BSSN USA',
            content: 'A robust digital platform for a security and solutions network. Key features include secure client portals and real-time service tracking.',
            metaTitle: 'BSSN USA - Security & Logistics',
            metaDesc: 'Corporate web presence for security firm.',
            tags: ['Corporate', 'Security', 'Web Development'],
            metadata: {
                year: '2024',
                url: 'https://bssnusa.com/',
                role: 'Lead Developer',
                services: ['Web App', 'Security Integration']
            },
            coverImage: '/projects/project-5.png',
            status: 'PUBLISHED',
            publishedAt: new Date()
        }
    });

    console.log('✅ CMS Content seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ CMS Seed failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
