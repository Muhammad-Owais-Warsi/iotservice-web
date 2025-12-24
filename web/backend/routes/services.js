const express = require('express');
const router = express.Router();
const prisma = require('../utils/prismaClient');
const { identifer } = require('../middleware/identifier');
const upload = require('../middleware/upload');

// ============================================
// RAISE TICKET (Admin, Master, Employee)
// ============================================
router.post('/', identifer(['ADMIN', 'MASTER', 'EMPLOYEE']), upload.array('photos', 5), async (req, res) => {
    try {
        const ticketData = req.body;

        // Extract photo URLs if files were uploaded
        const photos = req.files ? req.files.map(file => `/uploads/tickets/${file.filename}`) : [];

        const ticket = await prisma.serviceTicket.create({
            data: {
                ...ticketData,
                facilityId: ticketData.facilityId,
                date: ticketData.date ? new Date(ticketData.date) : null,
                time: ticketData.time ? new Date(ticketData.time) : null,
                photos: photos,
                status: 'open'
            }
        });

        res.status(201).json({ success: true, ticket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// VIEW TICKETS (All users can view their company's tickets, Admin views all)
// ============================================
router.get('/', identifer(), async (req, res) => {
    try {
        let where = {};

        if (req.user.role !== 'ADMIN') {
            // Non-admins only see tickets for their company
            where = {
                facility: {
                    companyId: req.user.companyId
                }
            };
        }

        const tickets = await prisma.serviceTicket.findMany({
            where,
            include: {
                facility: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// EDIT TICKET (Master, Employee)
// ============================================
router.put('/:id', identifer(['MASTER', 'EMPLOYEE']), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Verify ownership/company
        const ticket = await prisma.serviceTicket.findUnique({
            where: { id },
            include: { facility: true }
        });

        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        if (ticket.facility.companyId !== req.user.companyId) {
            return res.status(403).json({ error: 'Unauthorized to edit this ticket' });
        }

        const updatedTicket = await prisma.serviceTicket.update({
            where: { id },
            data: updateData
        });

        res.json({ success: true, ticket: updatedTicket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CLOSE TICKET (Master, Employee)
// ============================================
router.patch('/:id/close', identifer(['MASTER', 'EMPLOYEE']), async (req, res) => {
    try {
        const { id } = req.params;

        const ticket = await prisma.serviceTicket.findUnique({
            where: { id },
            include: { facility: true }
        });

        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        if (ticket.facility.companyId !== req.user.companyId) {
            return res.status(403).json({ error: 'Unauthorized to close this ticket' });
        }

        await prisma.serviceTicket.update({
            where: { id },
            data: { status: 'closed' }
        });

        res.json({ success: true, message: 'Ticket closed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ADMIN ACT ON TICKET
// ============================================
router.patch('/:id/act', identifer(['ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        await prisma.serviceTicket.update({
            where: { id },
            data: {
                status: status || 'in_progress',
                completionNotes: notes
            }
        });

        res.json({ success: true, message: 'Admin action recorded' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
