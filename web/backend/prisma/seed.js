const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const argon2 = require('argon2');

async function main() {
    console.log('🌱 Starting seed...');

    // Create Company
    const company = await prisma.company.create({
        data: {
            name: 'Acme Cold Chain',
            industry: 'pharma'
        }
    });

    // Create Facility
    const facility = await prisma.facility.create({
        data: {
            name: 'Main Warehouse',
            location: '123 Cold St, Freezer City',
            type: 'warehouse',
            companyId: company.id
        }
    });

    // Create Device
    const device = await prisma.device.create({
        data: {
            deviceId: 'sensor-001',
            name: 'Chiller Unit 1',
            type: 'temperature',
            status: 'active',
            facilityId: facility.id,
            companyId: company.id
        }
    });

    // Create User
    const password = await argon2.hash('password123');
    const user = await prisma.user.create({
        data: {
            email: 'admin@acme.com',
            password: password,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            companyId: company.id
        }
    });

    console.log(`✅ Seed finished.`);
    console.log(`   Created Company: ${company.name}`);
    console.log(`   Created Device: ${device.deviceId}`);
    console.log(`   Created User: ${user.email} / password123`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
