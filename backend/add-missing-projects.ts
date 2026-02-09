import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Adding missing CMS Projects...\n');

    // 1. Nouveau Wellness Concierge
    await prisma.cmsContent.upsert({
        where: { slug: 'nouveau-wellness-concierge' },
        update: {},
        create: {
            slug: 'nouveau-wellness-concierge',
            type: 'PORTFOLIO',
            title: 'Nouveau Wellness Concierge',
            content: 'A luxury wellness concierge service website. The design radiates calm and exclusivity, utilizing a soft color palette and elegant typography to reflect the brand\'s commitment to personalized care.',
            metaTitle: 'Nouveau Wellness Concierge',
            metaDesc: 'Luxury wellness concierge service website.',
            tags: ['Web Design', 'CMS Integration', 'Wellness'],
            metadata: {
                year: '2024',
                url: 'https://nouveauwc.com/',
                role: 'Full Stack Developer',
                services: ['Web Design', 'CMS Integration']
            },
            coverImage: '/projects/project-2.png',
            status: 'PUBLISHED',
            publishedAt: new Date()
        }
    });
    console.log('✅ Added: Nouveau Wellness Concierge');

    // 2. Cidasa
    await prisma.cmsContent.upsert({
        where: { slug: 'cidasa' },
        update: {},
        create: {
            slug: 'cidasa',
            type: 'PORTFOLIO',
            title: 'Cidasa',
            content: 'Corporate website for a leading industrial solutions provider. The focus was on structuring complex information into an accessible, professional digital presence.',
            metaTitle: 'Cidasa - Industrial Solutions',
            metaDesc: 'Corporate website for industrial solutions provider.',
            tags: ['Corporate Site', 'SEO', 'Industrial'],
            metadata: {
                year: '2023',
                url: 'https://cidasa.com.pe/',
                role: 'Frontend Developer',
                services: ['Corporate Site', 'SEO']
            },
            coverImage: '/projects/project-4.png',
            status: 'PUBLISHED',
            publishedAt: new Date()
        }
    });
    console.log('✅ Added: Cidasa');

    // 3. Virako Travel
    await prisma.cmsContent.upsert({
        where: { slug: 'virako-travel' },
        update: {},
        create: {
            slug: 'virako-travel',
            type: 'PORTFOLIO',
            title: 'Virako Travel',
            content: 'An immersive travel portal that invites users to explore Peruvian destinations. Rich media and storytelling methodologies were used to capture the essence of adventure.',
            metaTitle: 'Virako Travel - Explore Peru',
            metaDesc: 'Immersive travel portal for Peruvian destinations.',
            tags: ['Storytelling', 'Web Development', 'Travel'],
            metadata: {
                year: '2024',
                url: 'https://virakotravel.com/',
                role: 'Creative Director',
                services: ['Storytelling', 'Web Development']
            },
            coverImage: '/projects/project-6.png',
            status: 'PUBLISHED',
            publishedAt: new Date()
        }
    });
    console.log('✅ Added: Virako Travel');

    // 4. Brandistry
    await prisma.cmsContent.upsert({
        where: { slug: 'brandistry' },
        update: {},
        create: {
            slug: 'brandistry',
            type: 'PORTFOLIO',
            title: 'Brandistry',
            content: 'Portfolio site for a digital branding agency. The site itself is a testament to modern web trends, featuring bold typography and interactive micro-animations.',
            metaTitle: 'Brandistry - Digital Branding Agency',
            metaDesc: 'Portfolio site for digital branding agency.',
            tags: ['Motion Design', 'Branding', 'Portfolio'],
            metadata: {
                year: '2025',
                url: 'https://brandistry.digital/',
                role: 'Web Designer',
                services: ['Motion Design', 'Branding']
            },
            coverImage: '/projects/project-7.png',
            status: 'PUBLISHED',
            publishedAt: new Date()
        }
    });
    console.log('✅ Added: Brandistry');

    // 5. Trophy Club Frenchies
    await prisma.cmsContent.upsert({
        where: { slug: 'trophy-club-frenchies' },
        update: {},
        create: {
            slug: 'trophy-club-frenchies',
            type: 'PORTFOLIO',
            title: 'Trophy Club Frenchies',
            content: 'A showcase site for a premium French Bulldog breeder. The design emphasizes trust and pedigree through a clean, gallery-focused layout.',
            metaTitle: 'Trophy Club Frenchies - French Bulldog Breeder',
            metaDesc: 'Premium French Bulldog breeder showcase site.',
            tags: ['Gallery Design', 'Mobile Optimization', 'Pet Industry'],
            metadata: {
                year: '2025',
                url: 'https://trophyclubfrenchies.com/',
                role: 'Web Developer',
                services: ['Gallery Design', 'Mobile Optimization']
            },
            coverImage: '/projects/project-8.png',
            status: 'PUBLISHED',
            publishedAt: new Date()
        }
    });
    console.log('✅ Added: Trophy Club Frenchies');

    console.log('\n🎉 All missing projects added successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
