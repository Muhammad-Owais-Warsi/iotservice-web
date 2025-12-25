const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateUsers() {
    try {
        console.log('🔄 Starting user migration...\n');

        // Check for existing ADMIN users
        const adminUsers = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true, email: true, firstName: true, lastName: true }
        });

        if (adminUsers.length === 0) {
            console.log('ℹ️  No ADMIN users found to migrate.');
            console.log('✅ Migration not needed.\n');

            // Show current CUERON_ADMIN users
            const cueronAdmins = await prisma.user.findMany({
                where: { role: 'CUERON_ADMIN' },
                select: { id: true, email: true, firstName: true, lastName: true }
            });

            if (cueronAdmins.length > 0) {
                console.log('Current CUERON_ADMIN users:');
                cueronAdmins.forEach(admin => {
                    console.log(`  - ${admin.email} (${admin.firstName} ${admin.lastName})`);
                });
            } else {
                console.log('⚠️  No CUERON_ADMIN users exist!');
                console.log('Run "node create-admin.js" to create one.\n');
            }
            return;
        }

        console.log(`Found ${adminUsers.length} ADMIN user(s) to migrate:\n`);
        adminUsers.forEach(user => {
            console.log(`  - ${user.email} (${user.firstName} ${user.lastName})`);
        });

        console.log('\n🔄 Migrating ADMIN → CUERON_ADMIN...');

        // Update all ADMIN users to CUERON_ADMIN
        const result = await prisma.user.updateMany({
            where: { role: 'ADMIN' },
            data: { role: 'CUERON_ADMIN' }
        });

        console.log(`✅ Successfully migrated ${result.count} user(s)\n`);

        // Verify migration
        const cueronAdmins = await prisma.user.findMany({
            where: { role: 'CUERON_ADMIN' },
            select: { id: true, email: true, firstName: true, lastName: true, status: true }
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Current CUERON_ADMIN users:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        cueronAdmins.forEach(admin => {
            console.log(`📧 ${admin.email}`);
            console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
            console.log(`   Status: ${admin.status}`);
            console.log('');
        });

        // Show statistics
        const stats = await prisma.user.groupBy({
            by: ['role'],
            _count: true
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('User Statistics by Role:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        stats.forEach(stat => {
            console.log(`${stat.role}: ${stat._count} user(s)`);
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('✅ Migration completed successfully!\n');
        console.log('Next steps:');
        console.log('1. Inform users to clear their browser cache');
        console.log('2. Users should log out and log back in');
        console.log('3. Test the new admin dashboard\n');

    } catch (error) {
        console.error('❌ Error during migration:', error.message);
        console.error('\nMigration failed. Please check the error and try again.');
        console.error('Your data has not been modified.\n');
    } finally {
        await prisma.$disconnect();
    }
}

migrateUsers();
