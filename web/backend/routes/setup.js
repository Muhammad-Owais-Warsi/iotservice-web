const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const prisma = require('../utils/prismaClient');

router.post('/seed-data', async (req, res) => {
    try {
        console.log('🧪 Seeding test data (triggered via API)...');

        // 1. Cueron Company (Admin)
        let cueron = await prisma.company.findFirst({ where: { name: 'Cueron' } });
        if (!cueron) {
            cueron = await prisma.company.create({ data: { name: 'Cueron', industry: 'pharma' } });
        }

        // 2. Client Company (Acme Corp)
        let acme = await prisma.company.findFirst({ where: { name: 'Acme Corp' } });
        if (!acme) {
            acme = await prisma.company.create({ data: { name: 'Acme Corp', industry: 'food' } });
        }

        const password = await argon2.hash('test1234');

        const users = [
            { email: 'admin@test.com', role: 'CUERON_ADMIN', companyId: cueron.id, firstName: 'Cueron', lastName: 'Admin' },
            { email: 'staff@test.com', role: 'CUERON_EMPLOYEE', companyId: cueron.id, firstName: 'Cueron', lastName: 'Staff' },
            { email: 'master@test.com', role: 'MASTER', companyId: acme.id, firstName: 'Acme', lastName: 'Master' },
            { email: 'worker@test.com', role: 'EMPLOYEE', companyId: acme.id, firstName: 'Acme', lastName: 'Worker' }
        ];

        for (const u of users) {
            // Upsert users
            await prisma.user.upsert({
                where: { email: u.email },
                update: { role: u.role, companyId: u.companyId, password: password, isApproved: true, status: 'active' },
                create: { ...u, password: password, isApproved: true, status: 'active' }
            });
        }

        // 3. Create Facilities
        const cueronFacility = await prisma.facility.upsert({
            where: { id: 'cueron-hq' },
            update: { name: 'Cueron HQ', companyId: cueron.id },
            create: { id: 'cueron-hq', name: 'Cueron HQ', companyId: cueron.id, location: 'San Francisco', type: 'office' }
        });

        const acmeFacility = await prisma.facility.upsert({
            where: { id: 'acme-warehouse' },
            update: { name: 'Acme Warehouse', companyId: acme.id },
            create: { id: 'acme-warehouse', name: 'Acme Warehouse', companyId: acme.id, location: 'New York', type: 'cold_storage' }
        });

        // 4. Create Devices
        // These devices ensure facilities show up in some lists if filtering by existing devices
        await prisma.device.upsert({
            where: { deviceId: 'DEV-CUERON-01' },
            update: { facilityId: cueronFacility.id, companyId: cueron.id },
            create: { deviceId: 'DEV-CUERON-01', name: 'Cueron Monitor', type: 'temperature', status: 'active', facilityId: cueronFacility.id, companyId: cueron.id }
        });

        await prisma.device.upsert({
            where: { deviceId: 'DEV-ACME-01' },
            update: { facilityId: acmeFacility.id, companyId: acme.id },
            create: { deviceId: 'DEV-ACME-01', name: 'Acme Freezer', type: 'temperature', status: 'active', facilityId: acmeFacility.id, companyId: acme.id }
        });

        res.json({ success: true, message: 'Seeding complete' });
    } catch (error) {
        console.error('❌ Error seeding:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
