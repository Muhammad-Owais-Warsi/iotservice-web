const express = require('express');
const { PrismaClient } = require('@prisma/client');
const hmacService = require('../services/hmacService');
const alertService = require('../services/alertService');
const { identifer } = require('../middleware/identifier');

const prisma = new PrismaClient();

module.exports = (io) => {
    const router = express.Router();

    /**
     * POST /api/sensors/ingest
     * (Unprotected by identifier as it uses HMAC signature for device auth)
     */
    router.post('/ingest', async (req, res) => {
        try {
            const deviceId = req.headers['x-device-id'];
            const timestamp = req.headers['x-timestamp'];
            const receivedSignature = req.headers['x-signature'];

            if (!deviceId || !timestamp || !receivedSignature) {
                return res.status(400).json({
                    error: 'Missing required headers: x-device-id, x-timestamp, x-signature'
                });
            }

            const rawBody = req.rawBody;
            const isValid = hmacService.verifySignature(rawBody, timestamp, receivedSignature);

            if (!isValid) {
                return res.status(401).json({ error: 'HMAC_VALIDATION_FAILED', message: 'Invalid signature' });
            }

            const data = JSON.parse(rawBody);
            const readings = data.readings || [];

            if (!Array.isArray(readings) || readings.length === 0) {
                return res.status(400).json({ error: 'No readings provided' });
            }

            const device = await prisma.device.findUnique({
                where: { deviceId },
                include: { company: true }
            });

            if (!device) {
                return res.status(404).json({ error: 'Device not found', deviceId });
            }

            const storedReadings = [];

            for (const reading of readings) {
                const sensorData = await prisma.sensorData.create({
                    data: {
                        deviceId: device.id,
                        temperature: reading.temperature || null,
                        humidity: reading.humidity || null,
                        doorStatus: reading.door_status || null,
                        powerConsumption: reading.power_consumption || null,
                        timestamp: new Date(reading.ts)
                    }
                });

                storedReadings.push(sensorData);
                await alertService.checkThresholds(device, reading);
            }

            await prisma.device.update({
                where: { id: device.id },
                data: { lastSeen: new Date() }
            });

            // Broadcast real-time update
            io.to(`device-${deviceId}`).emit('sensor-update', {
                deviceId,
                readings: storedReadings,
                timestamp: new Date()
            });

            // Also broadcast to company room
            io.to(`company-${device.companyId}`).emit('sensor-update', {
                deviceId,
                companyId: device.companyId,
                readings: storedReadings,
                timestamp: new Date()
            });

            res.status(200).json({ success: true, count: readings.length });

        } catch (error) {
            res.status(500).json({ error: 'Sensor ingestion failed', details: error.message });
        }
    });

    /**
     * GET /api/sensors/current/:deviceId
     */
    router.get('/current/:deviceId', identifer(), async (req, res) => {
        try {
            const { deviceId } = req.params;

            const device = await prisma.device.findUnique({
                where: { deviceId }
            });

            if (!device) {
                return res.status(404).json({ error: 'Device not found' });
            }

            // Authorization: CUERON_ADMIN can see any; others only their company
            if (req.user.role !== 'CUERON_ADMIN' && req.user.role !== 'CUERON_EMPLOYEE') {
                if (device.companyId !== req.user.companyId) {
                    return res.status(403).json({ error: 'You do not have permission to view this device data' });
                }
            }

            const latestReading = await prisma.sensorData.findFirst({
                where: { deviceId: device.id },
                orderBy: { timestamp: 'desc' },
                take: 1
            });

            res.json(latestReading);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/sensors/history/:deviceId
     */
    router.get('/history/:deviceId', identifer(), async (req, res) => {
        try {
            const { deviceId } = req.params;
            const { startDate, endDate, limit = 100 } = req.query;

            const device = await prisma.device.findUnique({
                where: { deviceId }
            });

            if (!device) {
                return res.status(404).json({ error: 'Device not found' });
            }

            // Authorization
            if (req.user.role !== 'CUERON_ADMIN' && req.user.role !== 'CUERON_EMPLOYEE') {
                if (device.companyId !== req.user.companyId) {
                    return res.status(403).json({ error: 'You do not have permission to view this history' });
                }
            }

            const whereClause = { deviceId: device.id };

            if (startDate || endDate) {
                whereClause.timestamp = {};
                if (startDate) whereClause.timestamp.gte = new Date(startDate);
                if (endDate) whereClause.timestamp.lte = new Date(endDate);
            }

            const readings = await prisma.sensorData.findMany({
                where: whereClause,
                orderBy: { timestamp: 'desc' },
                take: parseInt(limit)
            });

            res.json(readings);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/sensors/company/:companyId
     * Admin view to get all sensors for a specific client
     */
    router.get('/company/:companyId', identifer(['CUERON_ADMIN', 'CUERON_EMPLOYEE']), async (req, res) => {
        try {
            const { companyId } = req.params;

            const devicesWithData = await prisma.device.findMany({
                where: { companyId },
                include: {
                    sensorData: {
                        orderBy: { timestamp: 'desc' },
                        take: 1
                    }
                }
            });

            res.json({ success: true, devices: devicesWithData });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};

