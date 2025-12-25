const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        console.log('🚀 Creating initial admin user...\n');

        // Get or create a company for Cueron
        let company = await prisma.company.findFirst({
            where: { name: 'Cueron' }
        });

        if (!company) {
            console.log('📦 Creating Cueron company...');
            company = await prisma.company.create({
                data: {
                    name: 'Cueron',
                    industry: 'pharma'
                }
            });
            console.log('✅ Cueron company created\n');
        } else {
            console.log('✅ Cueron company already exists\n');
        }

        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@cueron.com' }
        });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            console.log('\nIf you want to create a new admin, use a different email.\n');
            return;
        }

        // Create admin user
        console.log('🔐 Hashing password...');
        const hashedPassword = await argon2.hash('admin123');

        console.log('👤 Creating admin user...');
        const admin = await prisma.user.create({
            data: {
                email: 'admin@cueron.com',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'CUERON_ADMIN',
                status: 'active',
                isApproved: true,
                companyId: company.id
            }
        });

        console.log('\n✅ Admin user created successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    ', admin.email);
        console.log('🔑 Password: ', 'admin123');
        console.log('👤 Name:     ', `${admin.firstName} ${admin.lastName}`);
        console.log('🎭 Role:     ', admin.role);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('⚠️  IMPORTANT: Change the password after first login!\n');

    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        if (error.code === 'P2002') {
            console.error('A user with this email already exists.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
