const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AlertService {
    /**
     * Check if sensor reading violates thresholds
     */
    async checkThresholds(device, reading) {
        const thresholds = await prisma.threshold.findMany({
            where: { deviceId: device.id, enabled: true }
        });

        for (const threshold of thresholds) {
            let isViolating = false;

            if (threshold.metricType === 'temperature' && reading.temperature) {
                if (
                    (threshold.minValue && reading.temperature < threshold.minValue) ||
                    (threshold.maxValue && reading.temperature > threshold.maxValue)
                ) {
                    isViolating = true;
                }
            }

            if (threshold.metricType === 'humidity' && reading.humidity) {
                if (
                    (threshold.minValue && reading.humidity < threshold.minValue) ||
                    (threshold.maxValue && reading.humidity > threshold.maxValue)
                ) {
                    isViolating = true;
                }
            }

            if (threshold.metricType === 'door' && reading.door_status) {
                if (threshold.maxValue === 0 && reading.door_status === 'open') {
                    isViolating = true;
                }
            }

            if (isViolating) {
                await this.createAlert(device, threshold, reading);
            }
        }
    }

    /**
     * Create alert for threshold violation
     */
    async createAlert(device, threshold, reading) {
        const alert = await prisma.alert.create({
            data: {
                deviceId: device.id,
                companyId: device.companyId,
                title: `${threshold.metricType.toUpperCase()} Threshold Violation`,
                message: `${threshold.metricType} reading ${reading[threshold.metricType]} exceeds threshold`,
                severity: threshold.severity,
                type: 'threshold_violation'
            }
        });

        console.log(`⚠️  Alert created: ${alert.id}`);

        return alert;
    }

    /**
     * Get active alerts for company
     */
    async getActiveAlerts(companyId) {
        return prisma.alert.findMany({
            where: { companyId, status: 'active' },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Acknowledge alert
     */
    async acknowledgeAlert(alertId, userId) {
        return prisma.alert.update({
            where: { id: alertId },
            data: {
                status: 'acknowledged',
                acknowledgedBy: userId,
                acknowledgedAt: new Date()
            }
        });
    }

    /**
     * Resolve alert
     */
    async resolveAlert(alertId) {
        return prisma.alert.update({
            where: { id: alertId },
            data: {
                status: 'resolved',
                resolvedAt: new Date()
            }
        });
    }
}

module.exports = new AlertService();
