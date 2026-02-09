import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    // 1. Create SUPER_ADMIN
    const adminPassword = await bcrypt.hash('Fbalberto1910', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'alberto.farah.b@gmail.com' },
        update: {},
        create: {
            email: 'alberto.farah.b@gmail.com',
            name: 'Alberto Farah',
            password: adminPassword,
            role: 'SUPER_ADMIN',
            hourlyRate: 150,
        },
    });
    console.log('✅ SUPER_ADMIN:', admin.email);

    // 2. Create sample users
    const workerPassword = await bcrypt.hash('worker123', 10);
    const clientPassword = await bcrypt.hash('client123', 10);

    const maria = await prisma.user.upsert({
        where: { email: 'maria@iris.com' },
        update: {},
        create: {
            email: 'maria@iris.com',
            name: 'María López',
            password: workerPassword,
            role: 'WORKER',
            hourlyRate: 75,
        },
    });
    console.log('✅ WORKER:', maria.email);

    const carlos = await prisma.user.upsert({
        where: { email: 'carlos@iris.com' },
        update: {},
        create: {
            email: 'carlos@iris.com',
            name: 'Carlos Smith',
            password: workerPassword,
            role: 'WORKER',
            hourlyRate: 50,
        },
    });
    console.log('✅ WORKER:', carlos.email);

    // 3. Create Clients
    const client1 = await prisma.client.upsert({
        where: { email: 'ana@nuestrascasas.com' },
        update: {},
        create: {
            email: 'ana@nuestrascasas.com',
            name: 'Ana García',
            company: 'Nuestras Casas',
            status: 'ACTIVE',
        },
    });
    console.log('✅ CLIENT:', client1.email);

    const client2 = await prisma.client.upsert({
        where: { email: 'luis@bijoume.com' },
        update: {},
        create: {
            email: 'luis@bijoume.com',
            name: 'Luis Torres',
            company: 'Bijou Me',
            status: 'ACTIVE',
        },
    });
    console.log('✅ CLIENT:', client2.email);

    // 4. Create Projects (linked to clients, not with budget)
    const project1 = await prisma.project.upsert({
        where: { id: 'proj-nuestras-casas' },
        update: {},
        create: {
            id: 'proj-nuestras-casas',
            name: 'Nuestras Casas Website',
            description: 'Complete website redesign for real estate company',
            status: 'ACTIVE',
            clientId: client1.id,
            managerId: admin.id,
        },
    });
    console.log('✅ PROJECT:', project1.name);

    const project2 = await prisma.project.upsert({
        where: { id: 'proj-bijou-me' },
        update: {},
        create: {
            id: 'proj-bijou-me',
            name: 'Bijou Me E-commerce',
            description: 'E-commerce platform for jewelry store',
            status: 'ACTIVE',
            clientId: client2.id,
            managerId: admin.id,
        },
    });
    console.log('✅ PROJECT:', project2.name);

    const project3 = await prisma.project.upsert({
        where: { id: 'proj-iris-crm' },
        update: {},
        create: {
            id: 'proj-iris-crm',
            name: 'Iris CRM Development',
            description: 'Internal CRM system development',
            status: 'ACTIVE',
            clientId: client1.id,
            managerId: admin.id,
        },
    });
    console.log('✅ PROJECT:', project3.name);

    // 5. Create Tasks
    const tasks = [
        { title: 'Design Homepage', projectId: project1.id, assigneeId: maria.id, status: 'DONE' },
        { title: 'Develop Contact Form', projectId: project1.id, assigneeId: carlos.id, status: 'IN_PROGRESS' },
        { title: 'Property Listings Page', projectId: project1.id, assigneeId: maria.id, status: 'TODO' },
        { title: 'Setup Payment Gateway', projectId: project2.id, assigneeId: maria.id, status: 'IN_PROGRESS' },
        { title: 'Product Catalog Design', projectId: project2.id, assigneeId: carlos.id, status: 'DONE' },
        { title: 'Dashboard Components', projectId: project3.id, assigneeId: carlos.id, status: 'DONE' },
        { title: 'User Authentication', projectId: project3.id, assigneeId: carlos.id, status: 'DONE' },
        { title: 'Google Integration', projectId: project3.id, assigneeId: carlos.id, status: 'IN_PROGRESS' },
    ];

    for (const task of tasks) {
        await prisma.task.create({ data: task });
    }
    console.log('✅ TASKS:', tasks.length, 'created');

    // 6. Create Leads
    const leads = [
        { name: 'TechStart Inc', email: 'hello@techstart.io', company: 'TechStart Inc', status: 'NEW' as const, source: 'Website' },
        { name: 'Green Solutions', email: 'info@greensolutions.pe', company: 'Green Solutions', status: 'CONTACTED' as const, source: 'Referral' },
        { name: 'Fashion Hub', email: 'contact@fashionhub.com', company: 'Fashion Hub', status: 'QUALIFIED' as const, source: 'LinkedIn' },
    ];

    for (const lead of leads) {
        await prisma.lead.create({ data: { ...lead, assignedToId: admin.id } });
    }
    console.log('✅ LEADS:', leads.length, 'created');

    // 7. Create Chat Channel
    const generalChannel = await prisma.channel.upsert({
        where: { id: 'channel-general' },
        update: {},
        create: {
            id: 'channel-general',
            name: 'General',
            description: 'General discussion channel',
            isPrivate: false,
        },
    });

    // Add members to channel (field is userId, not memberId)
    await prisma.channelMember.createMany({
        data: [
            { channelId: generalChannel.id, userId: admin.id },
            { channelId: generalChannel.id, userId: maria.id },
            { channelId: generalChannel.id, userId: carlos.id },
        ],
        skipDuplicates: true,
    });
    console.log('✅ CHANNEL: General created with members');

    // 8. Create some messages
    const messages = [
        { channelId: generalChannel.id, senderId: admin.id, content: 'Welcome to Iris CRM! 🎉' },
        { channelId: generalChannel.id, senderId: maria.id, content: 'Thanks! Excited to be here.' },
        { channelId: generalChannel.id, senderId: carlos.id, content: "Let's build something great!" },
    ];

    for (const msg of messages) {
        await prisma.chatMessage.create({ data: msg });
    }
    console.log('✅ MESSAGES:', messages.length, 'created');

    // 9. Create Notifications
    const notifications = [
        { userId: admin.id, title: 'New Lead', message: 'TechStart Inc submitted a contact form', type: 'INFO' },
        { userId: admin.id, title: 'Task Completed', message: 'María completed "Design Homepage"', type: 'SUCCESS' },
        { userId: maria.id, title: 'New Assignment', message: 'You were assigned to "Property Listings Page"', type: 'INFO' },
    ];

    for (const notif of notifications) {
        await prisma.notification.create({ data: notif });
    }
    console.log('✅ NOTIFICATIONS:', notifications.length, 'created');

    // 10. Create CMS Content (Portfolio for public website - synced from frontend/src/data/projects.ts)
    const portfolioItems = [
        {
            slug: 'nuestras-casas',
            type: 'PORTFOLIO' as const,
            title: 'Nuestras Casas',
            content: 'A modern real estate platform designed to showcase premium properties in Arequipa. The interface focuses on high-quality imagery and seamless navigation to enhance the user\'s journey from discovery to contact.',
            metaTitle: 'Nuestras Casas | Portfolio',
            metaDesc: 'Modern real estate platform for premium properties in Arequipa',
            tags: ['real-estate', 'ux-ui-design', 'frontend'],
            metadata: {
                year: '2024',
                url: 'https://nuestrascasasaqp.com/',
                role: 'Lead Designer & Developer',
                services: ['UX/UI Design', 'Frontend Development'],
            },
            coverImage: '/projects/project-1.png',
            status: 'PUBLISHED',
        },
        {
            slug: 'nouveau-wellness-concierge',
            type: 'PORTFOLIO' as const,
            title: 'Nouveau Wellness Concierge',
            content: 'A luxury wellness concierge service website. The design radiates calm and exclusivity, utilizing a soft color palette and elegant typography to reflect the brand\'s commitment to personalized care.',
            metaTitle: 'Nouveau Wellness Concierge | Portfolio',
            metaDesc: 'Luxury wellness concierge service website',
            tags: ['wellness', 'web-design', 'cms'],
            metadata: {
                year: '2024',
                url: 'https://nouveauwc.com/',
                role: 'Full Stack Developer',
                services: ['Web Design', 'CMS Integration'],
            },
            coverImage: '/projects/project-2.png',
            status: 'PUBLISHED',
        },
        {
            slug: 'bijou-me',
            type: 'PORTFOLIO' as const,
            title: 'Bijou Me',
            content: 'An e-commerce destination for exclusive jewelry. The site features a sophisticated shopping experience with dynamic product showcases and a seamless checkout process.',
            metaTitle: 'Bijou Me | Portfolio',
            metaDesc: 'E-commerce destination for exclusive jewelry',
            tags: ['e-commerce', 'visual-identity', 'jewelry'],
            metadata: {
                year: '2025',
                url: 'https://bijoume.shop/',
                role: 'UI/UX Designer',
                services: ['E-commerce', 'Visual Identity'],
            },
            coverImage: '/projects/project-3.png',
            status: 'PUBLISHED',
        },
        {
            slug: 'cidasa',
            type: 'PORTFOLIO' as const,
            title: 'Cidasa',
            content: 'Corporate website for a leading industrial solutions provider. The focus was on structuring complex information into an accessible, professional digital presence.',
            metaTitle: 'Cidasa | Portfolio',
            metaDesc: 'Corporate website for industrial solutions provider',
            tags: ['corporate', 'seo', 'frontend'],
            metadata: {
                year: '2023',
                url: 'https://cidasa.com.pe/',
                role: 'Frontend Developer',
                services: ['Corporate Site', 'SEO'],
            },
            coverImage: '/projects/project-4.png',
            status: 'PUBLISHED',
        },
        {
            slug: 'bssn-usa',
            type: 'PORTFOLIO' as const,
            title: 'BSSN USA',
            content: 'A robust digital platform for a security and solutions network. Key features include secure client portals and real-time service tracking.',
            metaTitle: 'BSSN USA | Portfolio',
            metaDesc: 'Digital platform for security and solutions network',
            tags: ['web-app', 'security', 'portals'],
            metadata: {
                year: '2024',
                url: 'https://bssnusa.com/',
                role: 'Lead Developer',
                services: ['Web App', 'Security Integration'],
            },
            coverImage: '/projects/project-5.png',
            status: 'PUBLISHED',
        },
        {
            slug: 'virako-travel',
            type: 'PORTFOLIO' as const,
            title: 'Virako Travel',
            content: 'An immersive travel portal that invites users to explore Peruvian destinations. Rich media and storytelling methodologies were used to capture the essence of adventure.',
            metaTitle: 'Virako Travel | Portfolio',
            metaDesc: 'Immersive travel portal for Peruvian destinations',
            tags: ['travel', 'storytelling', 'web-development'],
            metadata: {
                year: '2024',
                url: 'https://virakotravel.com/',
                role: 'Creative Director',
                services: ['Storytelling', 'Web Development'],
            },
            coverImage: '/projects/project-6.png',
            status: 'PUBLISHED',
        },
        {
            slug: 'brandistry',
            type: 'PORTFOLIO' as const,
            title: 'Brandistry',
            content: 'Portfolio site for a digital branding agency. The site itself is a testament to modern web trends, featuring bold typography and interactive micro-animations.',
            metaTitle: 'Brandistry | Portfolio',
            metaDesc: 'Portfolio site for digital branding agency',
            tags: ['motion-design', 'branding', 'web-design'],
            metadata: {
                year: '2025',
                url: 'https://brandistry.digital/',
                role: 'Web Designer',
                services: ['Motion Design', 'Branding'],
            },
            coverImage: '/projects/project-7.png',
            status: 'PUBLISHED',
        },
        {
            slug: 'trophy-club-frenchies',
            type: 'PORTFOLIO' as const,
            title: 'Trophy Club Frenchies',
            content: 'A showcase site for a premium French Bulldog breeder. The design emphasizes trust and pedigree through a clean, gallery-focused layout.',
            metaTitle: 'Trophy Club Frenchies | Portfolio',
            metaDesc: 'Showcase site for premium French Bulldog breeder',
            tags: ['gallery-design', 'mobile', 'pets'],
            metadata: {
                year: '2025',
                url: 'https://trophyclubfrenchies.com/',
                role: 'Web Developer',
                services: ['Gallery Design', 'Mobile Optimization'],
            },
            coverImage: '/projects/project-8.png',
            status: 'PUBLISHED',
        },
    ];

    for (const item of portfolioItems) {
        await prisma.cmsContent.upsert({
            where: { slug: item.slug },
            update: item,
            create: {
                ...item,
                publishedAt: new Date(),
            },
        });
    }
    console.log('✅ PORTFOLIO:', portfolioItems.length, 'items created');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin: alberto.farah.b@gmail.com / Fbalberto1910');
    console.log('   Worker: maria@iris.com / worker123');
    console.log('   Worker: carlos@iris.com / worker123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
