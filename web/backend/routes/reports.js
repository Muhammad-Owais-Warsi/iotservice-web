const express = require('express');
const { PrismaClient } = require('@prisma/client');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/reports/compliance/:facilityId
 * Generate compliance report (PDF/Excel)
 */
router.get('/compliance/:facilityId', async (req, res) => {
    try {
        const { facilityId } = req.params;
        const { startDate, endDate, format = 'pdf' } = req.query;

        // Fetch sensor data
        const sensorData = await prisma.sensorData.findMany({
            where: {
                device: {
                    facilityId
                },
                timestamp: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            include: { device: true }
        });

        // Calculate metrics
        const violations = sensorData.filter(d => d.temperature > 25 || d.temperature < 15).length;
        const metrics = {
            totalReadings: sensorData.length,
            violations: violations,
            avgTemperature: (sensorData.reduce((sum, d) => sum + d.temperature, 0) / sensorData.length).toFixed(2),
            compliance: ((sensorData.length - violations) / sensorData.length * 100).toFixed(2) + '%'
        };

        if (format === 'excel') {
            // Generate Excel report
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Compliance Report');

            worksheet.columns = [
                { header: 'Timestamp', key: 'timestamp', width: 20 },
                { header: 'Temperature (°C)', key: 'temperature', width: 15 },
                { header: 'Humidity (%)', key: 'humidity', width: 15 },
                { header: 'Door Status', key: 'doorStatus', width: 12 }
            ];

            sensorData.forEach(reading => {
                worksheet.addRow({
                    timestamp: reading.timestamp.toISOString(),
                    temperature: reading.temperature,
                    humidity: reading.humidity,
                    doorStatus: reading.doorStatus
                });
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=compliance-report.xlsx');
            await workbook.xlsx.write(res);
        } else {
            // Generate PDF report
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=compliance-report.pdf');

            doc.fontSize(16).text('Compliance Report', 100, 100);
            doc.fontSize(12).text(`Date Range: ${startDate} to ${endDate}`, 100, 140);
            doc.fontSize(12).text(`Compliance Rate: ${metrics.compliance}`, 100, 170);
            doc.fontSize(12).text(`Violations: ${metrics.violations}`, 100, 200);

            doc.pipe(res);
            doc.end();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
