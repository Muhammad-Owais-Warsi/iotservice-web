const express = require('express');
const router = express.Router();
const alertService = require('../services/alertService');
const { identifer } = require('../middleware/identifier');
const prisma = require('../utils/prismaClient');

module.exports = (io) => {
    /**
     * GET /api/alerts
     * Fetch alerts based on role and filters
     */
    router.get('/', identifer(), async (req, res) => {
        try {
            const { status, companyId: queryCompanyId, limit = 50 } = req.query;

            const where = {};
            if (status) where.status = status;

            // Authorization logic
            if (req.user.role === 'CUERON_ADMIN' || req.user.role === 'CUERON_EMPLOYEE') {
                // Admin can filter by any company or see all
                if (queryCompanyId) where.companyId = queryCompanyId;
            } else {
                // Clients only see their own company
                where.companyId = req.user.companyId;
            }

            const alerts = await prisma.alert.findMany({
                where,
                include: {
                    device: {
                        select: { name: true, deviceId: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: parseInt(limit)
            });

            res.json({ success: true, alerts });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /api/alerts/acknowledge/:id
     */
    router.post('/acknowledge/:id', identifer(), async (req, res) => {
        try {
            const { id } = req.params;
            const alert = await prisma.alert.findUnique({ where: { id } });

            if (!alert) return res.status(404).json({ error: 'Alert not found' });

            // Check if user has permission to acknowledge
            if (req.user.role !== 'CUERON_ADMIN' && req.user.role !== 'CUERON_EMPLOYEE') {
                if (alert.companyId !== req.user.companyId) {
                    return res.status(403).json({ error: 'Permission denied' });
                }
            }

            const updatedAlert = await alertService.acknowledgeAlert(id, req.user.id);

            // Broadcast update
            io.to(`company-${alert.companyId}`).emit('alert-updated', updatedAlert);

            res.json({ success: true, alert: updatedAlert });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /api/alerts/resolve/:id
     */
    router.post('/resolve/:id', identifer(), async (req, res) => {
        try {
            const { id } = req.params;
            const alert = await prisma.alert.findUnique({ where: { id } });

            if (!alert) return res.status(404).json({ error: 'Alert not found' });

            // Authorization
            if (req.user.role !== 'CUERON_ADMIN' && req.user.role !== 'CUERON_EMPLOYEE') {
                if (alert.companyId !== req.user.companyId) {
                    return res.status(403).json({ error: 'Permission denied' });
                }
            }

            const updatedAlert = await alertService.resolveAlert(id);

            // Broadcast update
            io.to(`company-${alert.companyId}`).emit('alert-updated', updatedAlert);

            res.json({ success: true, alert: updatedAlert });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};

