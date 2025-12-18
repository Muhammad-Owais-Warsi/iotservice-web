const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const deviceId = 'sensor-001';

    const device = await prisma.device.findUnique({
        where: { deviceId }
    });

    if (!device) {
        console.error('Device sensor-001 not found. Run seed.js first.');
        return;
    }

    // Create High Temp Threshold
    const t1 = await prisma.threshold.upsert({
        where: {
            deviceId_metricType: {
                deviceId: device.id,
                metricType: 'temperature'
            }
        },
        update: {},
        create: {
            deviceId: device.id,
            metricType: 'temperature',
            minValue: 22.0,
            maxValue: 28.0,
            severity: 'critical',
            violationDuration: 0 // Immediate alert
        }
    });

    console.log(`✅ Threshold set for ${device.name}: 22.0 - 28.0 °C`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
