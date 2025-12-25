const express = require('express');
const router = express.Router();
const prisma = require('../utils/prismaClient');
const { identifer } = require('../middleware/identifier');

router.get('/', identifer(), async (req, res) => {
    try {
        const { companyId } = req.query;

        const where = {};
        if (req.user.role === 'CUERON_ADMIN' || req.user.role === 'CUERON_EMPLOYEE') {
            if (companyId) where.companyId = companyId;
        } else {
            where.companyId = req.user.companyId;
        }

        const devices = await prisma.device.findMany({
            where,
            include: {
                facility: { select: { name: true, location: true } },
                company: { select: { name: true } }
            },
            orderBy: { lastSeen: 'desc' }
        });
        res.json({ success: true, devices });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/register', identifer(['CUERON_ADMIN', 'MASTER']), async (req, res) => {
    try {
        const { name, deviceId, type, facilityId, companyId: bodyCompanyId } = req.body;

        let targetCompanyId = req.user.companyId;
        if (req.user.role === 'CUERON_ADMIN' || req.user.role === 'CUERON_EMPLOYEE') {
            targetCompanyId = bodyCompanyId;
        }

        if (!targetCompanyId) return res.status(400).json({ error: 'Company ID is required' });

        const device = await prisma.device.create({
            data: {
                name,
                deviceId,
                type,
                facilityId,
                companyId: targetCompanyId,
                status: 'active'
            }
        });

        res.status(201).json({ success: true, device });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', identifer(), async (req, res) => {
    try {
        const { id } = req.params;
        const device = await prisma.device.findUnique({
            where: { id },
            include: {
                facility: true,
                company: true,
                thresholds: true,
                _count: { select: { sensorData: true } }
            }
        });

        if (!device) return res.status(404).json({ error: 'Device not found' });

        // Authorization
        if (req.user.role !== 'CUERON_ADMIN' && req.user.role !== 'CUERON_EMPLOYEE') {
            if (device.companyId !== req.user.companyId) {
                return res.status(403).json({ error: 'Permission denied' });
            }
        }

        res.json({ success: true, device });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
