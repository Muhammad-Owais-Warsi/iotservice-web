const express = require('express');
const { PrismaClient } = require('@prisma/client');
const hmacService = require('../services/hmacService');
const alertService = require('../services/alertService');

const prisma = new PrismaClient();

module.exports = (io) => {
    const router = express.Router();

    /**
     * POST /api/sensors/ingest
     * 
     * Receives encrypted sensor data from IoT devices
     * Verifies HMAC signature before storing
     */
    router.post('/ingest', async (req, res) => {
        try {
            // ============================================
            // STEP 1: Extract headers
            // ============================================
            const deviceId = req.headers['x-device-id'];
            const timestamp = req.headers['x-timestamp'];
            const receivedSignature = req.headers['x-signature'];

            if (!deviceId || !timestamp || !receivedSignature) {
                return res.status(400).json({
                    error: 'Missing required headers: x-device-id, x-timestamp, x-signature'
                });
            }

            // ============================================
            // STEP 2: Verify HMAC signature (CRITICAL!)
            // ============================================
            const rawBody = req.rawBody;
            const isValid = hmacService.verifySignature(rawBody, timestamp, receivedSignature);

            if (!isValid) {
                console.error('❌ HMAC verification failed');
                console.error('Expected signature from request:', receivedSignature);
                console.error('Device ID:', deviceId);
                return res.status(401).json({
                    error: 'HMAC_VALIDATION_FAILED',
                    message: 'Invalid signature'
                });
            }

            console.log(`✅ HMAC verified for device: ${deviceId}`);

            // ============================================
            // STEP 3: Parse JSON
            // ============================================
            const data = JSON.parse(rawBody);
            const readings = data.readings || [];

            if (!Array.isArray(readings) || readings.length === 0) {
                return res.status(400).json({ error: 'No readings provided' });
            }

            // ============================================
            // STEP 4: Find device in database
            // ============================================
            const device = await prisma.device.findUnique({
                where: { deviceId }
            });

            if (!device) {
                return res.status(404).json({
                    error: 'Device not found',
                    deviceId
                });
            }

            // ============================================
            // STEP 5: Store sensor data
            // ============================================
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

                // ============================================
                // STEP 6: Check thresholds & create alerts
                // ============================================
                await alertService.checkThresholds(device, reading);
            }

            // ============================================
            // STEP 7: Update device last seen
            // ============================================
            await prisma.device.update({
                where: { id: device.id },
                data: { lastSeen: new Date() }
            });

            // ============================================
            // STEP 8: Broadcast real-time update via Socket.io
            // ============================================
            io.to(`device-${deviceId}`).emit('sensor-update', {
                deviceId,
                readings: storedReadings,
                timestamp: new Date()
            });

            // ============================================
            // STEP 9: Response
            // ============================================
            res.status(200).json({
                success: true,
                message: `${readings.length} readings ingested successfully`,
                deviceId,
                count: readings.length
            });

        } catch (error) {
            console.error('❌ Ingest error:', error.message);
            res.status(500).json({
                error: 'Sensor ingestion failed',
                details: error.message
            });
        }
    });

    /**
     * GET /api/sensors/current/:deviceId
     * Get latest sensor reading for a device
     */
    router.get('/current/:deviceId', async (req, res) => {
        try {
            const { deviceId } = req.params;

            const device = await prisma.device.findUnique({
                where: { deviceId }
            });

            if (!device) {
                return res.status(404).json({ error: 'Device not found' });
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
     * Get sensor history with optional time range
     */
    router.get('/history/:deviceId', async (req, res) => {
        try {
            const { deviceId } = req.params;
            const { startDate, endDate, limit = 100 } = req.query;

            const device = await prisma.device.findUnique({
                where: { deviceId }
            });

            if (!device) {
                return res.status(404).json({ error: 'Device not found' });
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

    return router;
};
