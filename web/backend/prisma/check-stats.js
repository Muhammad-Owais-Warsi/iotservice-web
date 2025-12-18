const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.sensorData.count();
    const alertCount = await prisma.alert.count();
    const alerts = await prisma.alert.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    console.log(`📊 Statistics:`);
    console.log(`- SensorReadings: ${count}`);
    console.log(`- Alerts Created: ${alertCount}`);

    if (alerts.length > 0) {
        console.log(`\n🚨 Recent Alerts:`);
        alerts.forEach(a => {
            console.log(`[${a.severity.toUpperCase()}] ${a.title}: ${a.message} (${a.status})`);
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
