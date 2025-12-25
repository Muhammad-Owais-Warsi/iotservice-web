const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    try {
        console.log('Attempting raw SQL fix for enum...');

        // Add new values individually (PostgreSQL doesn't support adding multiple values to an enum in one transaction)
        try { await prisma.$executeRawUnsafe('ALTER TYPE "UserRole" ADD VALUE \'CUERON_ADMIN\''); } catch (e) { console.log('CUERON_ADMIN might already exist or failed'); }
        try { await prisma.$executeRawUnsafe('ALTER TYPE "UserRole" ADD VALUE \'CUERON_EMPLOYEE\''); } catch (e) { console.log('CUERON_EMPLOYEE might already exist or failed'); }

        // Update existing users from ADMIN to CUERON_ADMIN
        const updated = await prisma.$executeRawUnsafe('UPDATE "User" SET role = \'CUERON_ADMIN\' WHERE role::text = \'ADMIN\'');
        console.log(`Updated ${updated} users to CUERON_ADMIN`);

        // Check current state
        const users = await prisma.$queryRawUnsafe('SELECT id, email, role FROM "User" LIMIT 5');
        console.log('Sample users:', users);

    } catch (error) {
        console.error('Error during raw fix:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fix();
