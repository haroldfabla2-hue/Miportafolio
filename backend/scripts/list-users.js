
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            email: true,
            name: true,
            role: true,
            createdAt: true
        }
    });

    console.log('--- USERS ---');
    if (users.length === 0) {
        console.log('No users found.');
    } else {
        users.forEach(user => {
            console.log(`Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
        });
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
