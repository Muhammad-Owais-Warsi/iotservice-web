const express = require("express");
const router = express.Router();
const { prisma, vendorPrisma } = require("../utils/prismaClient");

const { identifer } = require("../middleware/identifier");
const upload = require("../middleware/upload");

// ============================================
// RAISE TICKET (Admin, Master, Employee)
// ============================================
router.post(
    "/",
    identifer(["admin", "CUERON_EMPLOYEE", "MASTER", "EMPLOYEE"]),
    upload.array("photos", 5),
    async (req, res) => {
        try {
            // Explicitly map and typecast all fields from the new schema
            const {
                company_name,
                company_phone,
                company_email,
                brand_name,
                years_of_operation_in_equipment,
                location,
                inspection_date,
                inspection_time,
                gst,
                billing_address,
                equipment_type,
                equipment_sl_no,
                capacity,
                specification_plate_photo,
                poc_name,
                poc_phone,
                poc_email,
                problem_statement,
            } = req.body;

            // Extract photo URLs if files were uploaded
            const photos = req.files
                ? req.files.map((file) => {
                      if (file.filename)
                          return `/uploads/tickets/${file.filename}`;
                      // Fallback for Vercel/MemoryStorage (files are not actually saved to disk)
                      return `/uploads/tickets/vercel-simulated-${Date.now()}-${file.originalname}`;
                  })
                : [];

            const ticket = await vendorPrisma.tickets.create({
                data: {
                    company_name,
                    company_phone,
                    company_email,
                    brand_name,
                    years_of_operation_in_equipment:
                        years_of_operation_in_equipment
                            ? parseInt(years_of_operation_in_equipment, 10)
                            : null,
                    location,
                    inspection_date:
                        inspection_date && !isNaN(Date.parse(inspection_date))
                            ? new Date(inspection_date)
                            : null,
                    inspection_time:
                        inspection_time && !isNaN(Date.parse(inspection_time))
                            ? new Date(inspection_time)
                            : null,
                    photos,
                    gst,
                    billing_address,
                    equipment_type,
                    equipment_sl_no,
                    capacity: capacity ? parseInt(capacity, 10) : null,
                    specification_plate_photo,
                    poc_name,
                    poc_phone,
                    poc_email,
                    problem_statement,
                    // status: "created",
                    // created_at will default to now() in the DB
                },
            });

            res.status(201).json({ success: true, ticket });
        } catch (error) {
            console.error("❌ Ticket creation error:", error);
            res.status(500).json({ error: error.message, details: error.code });
        }
    },
);

// ============================================
// VIEW TICKETS (All users can view their company's tickets, Admin views all)
// ============================================
router.get("/", identifer(), async (req, res) => {
    try {
        const tickets = await vendorPrisma.tickets.findMany({
            orderBy: { created_at: "desc" },
        });

        res.json({ success: true, tickets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// EDIT TICKET (Master, Employee)
// ============================================
router.put("/:id", identifer(["MASTER", "EMPLOYEE"]), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Verify ownership/company
        const ticket = await prisma.serviceTicket.findUnique({
            where: { id },
            include: { facility: true },
        });

        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.facility.companyId !== req.user.companyId) {
            return res
                .status(403)
                .json({ error: "Unauthorized to edit this ticket" });
        }

        const updatedTicket = await prisma.serviceTicket.update({
            where: { id },
            data: updateData,
        });

        res.json({ success: true, ticket: updatedTicket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CLOSE TICKET (Master, Employee)
// ============================================
router.patch(
    "/:id/close",
    identifer(["MASTER", "EMPLOYEE"]),
    async (req, res) => {
        try {
            const { id } = req.params;

            const ticket = await prisma.serviceTicket.findUnique({
                where: { id },
                include: { facility: true },
            });

            if (!ticket)
                return res.status(404).json({ error: "Ticket not found" });
            if (ticket.facility.companyId !== req.user.companyId) {
                return res
                    .status(403)
                    .json({ error: "Unauthorized to close this ticket" });
            }

            await prisma.serviceTicket.update({
                where: { id },
                data: { status: "closed" },
            });

            res.json({ success: true, message: "Ticket closed" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
);

// ============================================
// ADMIN ACT ON TICKET
// ============================================
router.patch("/:id/act", identifer(["CUERON_ADMIN"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        await prisma.serviceTicket.update({
            where: { id },
            data: {
                status: status || "in_progress",
                completionNotes: notes,
            },
        });

        res.json({ success: true, message: "Admin action recorded" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
