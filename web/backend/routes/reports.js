const express = require('express');
const { PrismaClient } = require('@prisma/client');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const { identifer } = require('../middleware/identifier');

const router = express.Router();
const prisma = new (require('@prisma/client').PrismaClient)();

/**
 * GET /api/reports/:type/:facilityId
 * types: today, last7days, last30days
 */
router.get('/:type/:facilityId', identifer(), async (req, res) => {
    try {
        const { type, facilityId } = req.params;

        // Security: Verify facility belongs to user's company
        const facility = await prisma.facility.findUnique({
            where: { id: facilityId }
        });

        if (!facility) return res.status(404).json({ error: 'Facility not found' });

        if (req.user.role !== 'CUERON_ADMIN' && req.user.role !== 'CUERON_EMPLOYEE') {
            if (facility.companyId !== req.user.companyId) {
                return res.status(403).json({ error: 'Unauthorized: Facility belongs to another company' });
            }
        }

        const { format = 'pdf' } = req.query;

        let startDate = new Date();
        let endDate = new Date();

        if (type === 'today') {
            startDate.setHours(0, 0, 0, 0);
        } else if (type === 'last7days') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (type === 'last30days') {
            startDate.setDate(startDate.getDate() - 30);
        } else {
            return res.status(400).json({ error: 'Invalid report type' });
        }

        // Fetch sensor data
        const sensorData = await prisma.sensorData.findMany({
            where: {
                device: { facilityId },
                timestamp: { gte: startDate, lte: endDate }
            },
            include: { device: true },
            orderBy: { timestamp: 'asc' }
        });

        if (sensorData.length === 0) {
            return res.status(404).json({ error: 'No data found for this period' });
        }

        // Calculate basic metrics
        const totalReadings = sensorData.length;
        const temps = sensorData.map(d => d.temperature).filter(t => t !== null);
        const avgTemp = temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2) : 'N/A';

        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Report');
            worksheet.columns = [
                { header: 'Device', key: 'device', width: 20 },
                { header: 'Timestamp', key: 'timestamp', width: 25 },
                { header: 'Temperature (°C)', key: 'temperature', width: 15 },
                { header: 'Humidity (%)', key: 'humidity', width: 15 },
                { header: 'Door Status', key: 'doorStatus', width: 12 }
            ];

            sensorData.forEach(reading => {
                worksheet.addRow({
                    device: reading.device.name,
                    timestamp: reading.timestamp.toLocaleString(),
                    temperature: reading.temperature,
                    humidity: reading.humidity,
                    doorStatus: reading.doorStatus
                });
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=report-${type}.xlsx`);
            await workbook.xlsx.write(res);
        } else {
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=report-${type}.pdf`);

            doc.fontSize(20).text(`Environmental Report - ${type.toUpperCase()}`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Facility ID: ${facilityId}`);
            doc.text(`Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
            doc.text(`Total Readings: ${totalReadings}`);
            doc.text(`Average Temperature: ${avgTemp}°C`);
            doc.moveDown();

            doc.fontSize(14).text('Data Summary (First 20 readings):');
            sensorData.slice(0, 20).forEach(r => {
                doc.fontSize(10).text(`${r.timestamp.toLocaleString()} | ${r.device.name} | Temp: ${r.temperature}°C | Door: ${r.doorStatus}`);
            });

            doc.pipe(res);
            doc.end();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
