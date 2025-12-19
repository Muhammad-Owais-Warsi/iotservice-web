const { PrismaClient } = require('@prisma/client');
const emailService = require('./emailService');

const prisma = new PrismaClient();

class AlertService {
    /**
     * Check if sensor reading violates thresholds and handle escalation
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

            // Door logic: If door is open, it might be an anomaly depending on setup
            if (threshold.metricType === 'door' && reading.door_status) {
                if (threshold.maxValue === 0 && reading.door_status === 'open') {
                    isViolating = true;
                }
            }

            if (isViolating) {
                await this.handleViolation(device, threshold, reading);
            } else {
                await this.resolveIfActive(device.id, threshold.metricType);
            }
        }
    }

    /**
     * Handle violation with escalation logic
     */
    async handleViolation(device, threshold, reading) {
        // Find existing active alert
        let alert = await prisma.alert.findFirst({
            where: {
                deviceId: device.id,
                type: 'threshold_violation',
                status: 'active',
                title: { contains: threshold.metricType.toUpperCase() }
            },
            orderBy: { createdAt: 'desc' }
        });

        const now = new Date();

        if (!alert) {
            // Create new alert if none active
            alert = await prisma.alert.create({
                data: {
                    deviceId: device.id,
                    companyId: device.companyId,
                    title: `${threshold.metricType.toUpperCase()} Threshold Violation`,
                    message: `${threshold.metricType} reading ${reading[threshold.metricType] || reading.temperature || reading.humidity} violates threshold. Door is ${reading.door_status || 'unknown'}.`,
                    severity: threshold.severity,
                    type: 'threshold_violation'
                }
            });
            console.log(`⚠️  New alert created: ${alert.id}`);
            return;
        }

        // Calculate duration in minutes
        const durationMinutes = Math.floor((now - alert.createdAt) / 60000);

        // Escalation Logic
        // 5 mins: Engineer (Employee)
        if (durationMinutes >= 5 && durationMinutes < 15 && alert.attempts === 0) {
            await this.escalate(alert, 'EMPLOYEE', 'Engineer');
            await prisma.alert.update({ where: { id: alert.id }, data: { attempts: 1 } });
        }
        // 15 mins: All Master accounts
        else if (durationMinutes >= 15 && durationMinutes < 30 && alert.attempts === 1) {
            await this.escalate(alert, 'MASTER', 'All Masters');
            await prisma.alert.update({ where: { id: alert.id }, data: { attempts: 2 } });
        }
        // 30 mins: Admin
        else if (durationMinutes >= 30 && alert.attempts === 2) {
            await this.escalate(alert, 'ADMIN', 'Admin');
            await prisma.alert.update({ where: { id: alert.id }, data: { attempts: 3 } });
        }
    }

    /**
     * Escalate alert to specific role
     */
    async escalate(alert, role, roleDisplayName) {
        try {
            const users = await prisma.user.findMany({
                where: {
                    role: role,
                    companyId: role === 'ADMIN' ? undefined : alert.companyId,
                    status: 'active'
                }
            });

            const emails = users.map(u => u.email).filter(e => e);
            if (emails.length === 0) return;

            const device = await prisma.device.findUnique({ where: { id: alert.deviceId } });

            await emailService.notifyAnomaly(
                emails,
                device.name,
                alert.title,
                Math.floor((new Date() - alert.createdAt) / 60000)
            );

            console.log(`🚀 Escalated alert ${alert.id} to ${roleDisplayName} (${emails.join(', ')})`);
        } catch (error) {
            console.error('❌ Escalation failed:', error);
        }
    }

    /**
     * Resolve alert if it was active but condition is now cleared
     */
    async resolveIfActive(deviceId, metricType) {
        const activeAlert = await prisma.alert.findFirst({
            where: {
                deviceId,
                status: 'active',
                title: { contains: metricType.toUpperCase() }
            }
        });

        if (activeAlert) {
            await prisma.alert.update({
                where: { id: activeAlert.id },
                data: {
                    status: 'resolved',
                    resolvedAt: new Date()
                }
            });
            console.log(`✅ Alert resolved: ${activeAlert.id}`);
        }
    }

    async getActiveAlerts(companyId) {
        return prisma.alert.findMany({
            where: { companyId, status: 'active' },
            orderBy: { createdAt: 'desc' }
        });
    }

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
