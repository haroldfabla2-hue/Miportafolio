
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';

async function main() {
    console.log('--- STARTING CORE DEBUG ---');

    // 1. Test Key Dependencies
    try {
        console.log('1. Testing bcryptjs...');
        const hash = await bcrypt.hash('test1234', 10);
        const valid = await bcrypt.compare('test1234', hash);
        console.log('   Bcrypt status:', valid ? 'OK' : 'FAIL');
    } catch (e) {
        console.error('   Bcrypt Check Failed:', e);
        process.exit(1);
    }

    // 2. Test DB Connection
    try {
        console.log('2. Testing Prisma Connection...');
        await prisma.$connect();
        console.log('   Prisma Connected.');
    } catch (e) {
        console.error('   Prisma Config Error:', e);
        process.exit(1);
    }

    // 3. Simulate Login Flow
    const email = 'alberto.farah.b@gmail.com'; // Adjust if needed
    console.log(`3. Simulating Login for: ${email}`);

    try {
        // A. Find User
        console.log('   A. Finding user...');
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log('   User not found. Creating test user...');
            // Create minimal user if missing
            /*
            await prisma.user.create({
                data: { 
                    email, 
                    name: 'Debug User', 
                    password: await bcrypt.hash('password123', 10) 
                }
            });
            console.log('   Test user created.');
            */
            return;
        }
        console.log(`   User found: ${user.id} (${user.role})`);

        // B. Upsert Token (Suspected Crash Area)
        console.log('   B. Testing Token Upsert...');
        const dummyToken = 'debug-token-' + Date.now();

        await prisma.refreshToken.create({
            data: {
                token: dummyToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60)
            }
        });
        console.log('   Token Upsert: OK');

        // C. JWT Generation
        console.log('   C. Testing JWT Sign...');
        const token = jwt.sign({ sub: user.id }, JWT_SECRET);
        console.log('   JWT Sign: OK');

    } catch (e) {
        console.error('!!! CRITICAL FAILURE IN FLOW !!!');
        console.error(e);
    } finally {
        await prisma.$disconnect();
        console.log('--- END CORE DEBUG ---');
    }
}

main();
