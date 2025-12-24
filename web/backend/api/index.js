const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173' }
});

const prisma = new PrismaClient();

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(morgan('combined'));
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

// ============================================
// SOCKET.IO CONNECTION
// ============================================

io.on('connection', (socket) => {
    console.log(`📱 Client connected: ${socket.id}`);

    // Subscribe to device-specific updates
    socket.on('subscribe-device', (deviceId) => {
        socket.join(`device-${deviceId}`);
        console.log(`✅ Client subscribed to device: ${deviceId}`);
    });

    // Subscribe to company-wide updates
    socket.on('subscribe-company', (companyId) => {
        socket.join(`company-${companyId}`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

// ============================================
// ROUTES IMPORT
// ============================================

const authRoutes = require('../routes/auth');
const sensorRoutes = require('../routes/sensors');
const alertRoutes = require('../routes/alerts');
const deviceRoutes = require('../routes/devices');
const analyticsRoutes = require('../routes/analytics');
const reportRoutes = require('../routes/reports');
const serviceRoutes = require('../routes/services');

// ============================================
// ROUTE MOUNTING
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes(io));
app.use('/api/alerts', alertRoutes(io));
app.use('/api/devices', deviceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/services', serviceRoutes);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: err.message });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

// On Vercel, we don't call .listen() - Vercel handles the serverless lifecycle
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    server.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Socket.io ready for real-time connections`);
    });
}

// Export the app for Vercel
module.exports = app;