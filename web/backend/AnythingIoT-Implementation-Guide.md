# AnythingIoT Cold Chain Monitoring System
## End-to-End Implementation Guide
### Build from Scratch with React 19 + Node.js + PostgreSQL + WebSockets

**Author:** Your Development Team  
**Date:** December 2025  
**Project Status:** Fresh Build - Production Ready  
**Tech Stack:** React 19 + Vite | Node.js + Express | PostgreSQL | Socket.io | Argon2  

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack Finalization](#tech-stack-finalization)
3. [Architecture Design](#architecture-design)
4. [Phase 1: Database Setup](#phase-1-database-setup)
5. [Phase 2: Backend Implementation](#phase-2-backend-implementation)
6. [Phase 3: Frontend Implementation](#phase-3-frontend-implementation)
7. [Phase 4: Real-time Integration](#phase-4-real-time-integration)
8. [Phase 5: IoT Sensor Integration](#phase-5-iot-sensor-integration)
9. [Phase 6: Analytics & Reporting](#phase-6-analytics--reporting)
10. [Phase 7: Deployment & DevOps](#phase-7-deployment--devops)
11. [Risk Mitigation & HMAC Security](#risk-mitigation--hmac-security)
12. [Timeline & Milestones](#timeline--milestones)

---

## 🎯 Project Overview

### What We're Building

**AnythingIoT** is an enterprise-grade cold chain monitoring system designed for pharmaceutical, food, and chemical logistics companies.

**Core Capabilities:**
- ✅ Real-time IoT sensor monitoring (temperature, humidity, door status, power consumption)
- ✅ Intelligent alerting system with multi-channel notifications (SMS, email, push, in-app)
- ✅ Advanced analytics and compliance reporting
- ✅ Multi-facility enterprise support
- ✅ Industry-specific compliance (Pharma ±0.5°C, Food HACCP, Chemical DOT/IATA)
- ✅ HMAC-SHA256 secure data ingestion
- ✅ Real-time WebSocket dashboards
- ✅ Energy Recovery Ventilation (ERV) optimization

### Success Criteria

| Metric | Target | Status |
|--------|--------|--------|
| Sensor ingestion latency | <500ms | ⏳ |
| Dashboard real-time updates | <1s | ⏳ |
| HMAC validation success rate | 100% | ⏳ |
| Alert delivery time | <5s | ⏳ |
| System uptime | 99.9% | ⏳ |
| Concurrent users | 1000+ | ⏳ |

---

## 🔧 Tech Stack Finalization

### Your Chosen Stack (Optimized for AnythingIoT)

```
┌─────────────────────────────────────────────────────────┐
│                      ANYTHINGIOT STACK                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  FRONTEND                                                │
│  ├─ React 19 (Latest)                                   │
│  ├─ Vite 6.3.3 (Build tool)                            │
│  ├─ Tailwind CSS 3 (Styling)                           │
│  ├─ Framer Motion (Animations)                         │
│  ├─ Chart.js + React Chartjs 2 (Charts)               │
│  ├─ Lucide Icons (Icons)                               │
│  ├─ React Router DOM (Routing)                         │
│  ├─ Axios (HTTP client)                                │
│  ├─ Socket.io-client (Real-time)                       │
│  ├─ React Hook Form (Forms)                            │
│  └─ React Toastify (Notifications)                     │
│                                                          │
│  BACKEND                                                 │
│  ├─ Node.js 20+                                        │
│  ├─ Express 4.18+ (API Framework)                      │
│  ├─ PostgreSQL 15+ (via Neon or local)                │
│  ├─ Prisma 5.x (ORM)                                   │
│  ├─ Socket.io 4.x (Real-time)                          │
│  ├─ JWT (Authentication)                               │
│  ├─ Argon2 (Password hashing - UPGRADED)              │
│  ├─ Joi (Validation)                                   │
│  ├─ Nodemailer (Email)                                 │
│  ├─ Bull + Redis (Job queue)                           │
│  ├─ crypto (HMAC-SHA256)                               │
│  ├─ Multer (File uploads)                              │
│  ├─ ExcelJS (Excel export)                             │
│  ├─ PDFKit (PDF export)                                │
│  ├─ Cors (Cross-origin)                                │
│  ├─ Dotenv (Environment)                               │
│  └─ Morgan (Logging)                                   │
│                                                          │
│  DEVOPS & DEPLOYMENT                                    │
│  ├─ Docker (Containerization)                          │
│  ├─ GitHub Actions (CI/CD)                             │
│  ├─ Vercel (Frontend deployment)                       │
│  ├─ Railway/Render (Backend deployment)               │
│  └─ Neon (PostgreSQL serverless)                       │
│                                                          │
│  TESTING & QUALITY                                      │
│  ├─ Jest (Unit tests)                                  │
│  ├─ Vitest (Frontend tests)                            │
│  ├─ Supertest (API tests)                              │
│  └─ Prisma Studio (DB debugging)                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Dependencies Installation

```bash
# Backend
mkdir anythingiot-backend && cd anythingiot-backend
npm init -y

# Core dependencies
npm install express cors dotenv morgan
npm install @prisma/client prisma
npm install socket.io
npm install jsonwebtoken argon2
npm install joi multer
npm install nodemailer axios
npm install bull redis
npm install exceljs pdfkit
npm install crypto
npm install --save-dev jest supertest nodemon

# Initialize Prisma
npx prisma init

# Frontend
cd ../
npx create-vite@latest anythingiot-frontend --template react
cd anythingiot-frontend
npm install
npm install react-router-dom axios socket.io-client
npm install react-hook-form
npm install framer-motion lucide-react chart.js react-chartjs-2
npm install react-toastify
npm install --save-dev tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 🏗️ Architecture Design

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     IoT SENSORS LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Temp     │  │ Humidity │  │ Door     │  │ Power    │        │
│  │ Sensor   │  │ Sensor   │  │ Sensor   │  │ Consumption
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │               │
│       └─────────────┴─────────────┴─────────────┘               │
│                         │                                        │
│                    HMAC-SHA256                                   │
│                  Encryption Layer                               │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          │ HTTPS + HMAC Signed
                          │
┌─────────────────────────▼────────────────────────────────────────┐
│              EXPRESS BACKEND (Node.js)                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ API ROUTES                                              │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ POST   /api/sensors/ingest      (HMAC verified)        │    │
│  │ GET    /api/sensors/current     (Live data)            │    │
│  │ POST   /api/alerts/create       (Auto + Manual)        │    │
│  │ GET    /api/alerts              (Alert history)        │    │
│  │ POST   /api/devices/register    (Device onboarding)    │    │
│  │ GET    /api/analytics/dashboard (Real-time metrics)    │    │
│  │ POST   /api/auth/login          (JWT)                  │    │
│  │ GET    /api/reports/compliance  (PDF/Excel)            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ BUSINESS LOGIC LAYER                                    │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ • HMAC Verification Service                            │    │
│  │ • Alert Processing & Escalation                        │    │
│  │ • Anomaly Detection Engine                             │    │
│  │ • Compliance Report Generator                          │    │
│  │ • ERV Calculation Engine                               │    │
│  │ • Multi-channel Notification Queue                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ REALTIME LAYER (Socket.io)                             │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ • Broadcast sensor updates                             │    │
│  │ • Live alert notifications                             │    │
│  │ • Dashboard sync                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────┬──────────────────────┬──────────────────┬──────────────────┘
       │                      │                  │
       │                      │                  │
       ▼                      ▼                  ▼
┌─────────────┐      ┌─────────────┐    ┌─────────────┐
│ PostgreSQL  │      │ Redis       │    │ Bull Queue  │
│ (Neon)      │      │ (Caching)   │    │ (Jobs)      │
└─────────────┘      └─────────────┘    └─────────────┘
       ▲
       │
┌──────┴──────────────────────────────────────────────────────────┐
│           REACT 19 FRONTEND (Vite)                              │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ PAGES                                                  │   │
│  │ • Dashboard (Real-time metrics)                        │   │
│  │ • Sensor Monitor (Live data streams)                   │   │
│  │ • Alert Center (Alert history + escalation)            │   │
│  │ • Analytics (Trends, predictions)                      │   │
│  │ • Compliance Reports (PDF/Excel download)              │   │
│  │ • Device Management (Onboard, configure)               │   │
│  │ • Settings (User, thresholds, notifications)            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Socket.io Connection: Real-time updates                       │
│  State Management: React Hooks + Context                       │
│  Charts: Chart.js for visualizations                           │
│  Notifications: React Toastify + In-app alerts                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. SENSOR → Python send_encrypted.py
   • Temperature reading: 23.5°C
   • Humidity: 65%
   • Door status: closed
   • Timestamp: 1734415200000ms

2. ENCRYPTION (HMAC-SHA256)
   • Payload: {"readings":[{"ts":"...","sensor_id":"...","temperature":23.5,"humidity":65,"door_status":"closed"}]}
   • Secret: 9vA3xKp2nR8sL7qW4eY1zU6tH5mJ0cB2
   • Formula: HMAC_SHA256(Payload + Timestamp)
   • Headers: X-Device-Id, X-Timestamp, X-Signature

3. TRANSMISSION (HTTPS POST)
   POST https://api.anythingiot.com/api/sensors/ingest
   Headers: X-Device-Id, X-Timestamp, X-Signature

4. BACKEND VERIFICATION (Express)
   • Verify X-Signature against recalculated HMAC
   • If valid: Parse JSON, process data
   • If invalid: Return 401 Unauthorized

5. DATA STORAGE (PostgreSQL via Prisma)
   INSERT INTO sensor_data (device_id, temperature, humidity, timestamp)
   VALUES ('device-123', 23.5, 65, NOW())

6. REAL-TIME BROADCAST (Socket.io)
   io.to('device-device-123').emit('sensor-update', {
     deviceId: 'device-123',
     temperature: 23.5,
     humidity: 65,
     timestamp: Date.now()
   })

7. ALERT CHECK
   IF temperature > 25°C (threshold) for >5min
     → Create Alert
     → Queue notification jobs (Email, SMS, Push)
     → Emit to connected clients

8. FRONTEND UPDATE (React)
   socket.on('sensor-update', (data) => {
     setSensorData(prev => [...prev, data])
     // Update charts, metrics, alerts
   })
```

---

## 📊 Phase 1: Database Setup

### 1.1 Prisma Schema Design

Create `prisma/schema.prisma`:

```prisma
// This is your database schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// AUTHENTICATION & USERS
// ============================================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed with Argon2
  firstName String?
  lastName  String?
  role      UserRole @default(OPERATOR)
  status    String   @default("active")
  
  company   Company @relation(fields: [companyId], references: [id])
  companyId String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([companyId])
  @@index([email])
}

enum UserRole {
  ADMIN
  MANAGER
  OPERATOR
  AUDITOR
  VENDOR
}

// ============================================
// BUSINESS ENTITIES
// ============================================

model Company {
  id       String    @id @default(uuid())
  name     String
  industry String    // "pharma", "food", "chemical"
  
  facilities  Facility[]
  users       User[]
  devices     Device[]
  alerts      Alert[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Facility {
  id          String   @id @default(uuid())
  name        String
  location    String   // Address
  coordinates String?  // lat,long
  type        String   // "warehouse", "transport", "storage"
  
  company     Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId   String
  
  devices     Device[]
  serviceTickets ServiceTicket[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([companyId])
}

// ============================================
// IOT DEVICES
// ============================================

model Device {
  id           String   @id @default(uuid())
  name         String
  deviceId     String   @unique  // Physical device ID
  type         String   // "temperature", "humidity", "door", "power"
  status       String   @default("active")  // active, inactive, error
  lastSeen     DateTime?
  firmwareVersion String?
  
  facility     Facility @relation(fields: [facilityId], references: [id], onDelete: Cascade)
  facilityId   String
  
  company      Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId    String
  
  // Sensor configuration
  sensorData   SensorData[]
  thresholds   Threshold[]
  alerts       Alert[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([facilityId])
  @@index([companyId])
  @@index([deviceId])
  @@index([status])
}

// ============================================
// SENSOR DATA (TIME-SERIES)
// ============================================

model SensorData {
  id        String   @id @default(uuid())
  
  deviceId  String
  device    Device @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  
  // Sensor readings
  temperature  Float?
  humidity     Float?
  doorStatus   String?      // "open", "closed"
  powerConsumption Float?
  
  // Metadata
  timestamp    DateTime @default(now())
  
  createdAt DateTime @default(now())
  
  @@index([deviceId, timestamp])  // Critical for time-series queries
  @@index([timestamp])
}

// ============================================
// THRESHOLDS & ALERTS
// ============================================

model Threshold {
  id        String   @id @default(uuid())
  
  device    Device @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  deviceId  String
  
  metricType    String    // "temperature", "humidity", "door", "power"
  minValue      Float?
  maxValue      Float?
  
  // Alert behavior
  violationDuration Int @default(300) // 5 minutes in seconds
  severity      String @default("warning")  // "warning", "critical"
  
  enabled   Boolean @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([deviceId])
  @@unique([deviceId, metricType])
}

model Alert {
  id        String   @id @default(uuid())
  
  device    Device @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  deviceId  String
  
  company   Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId String
  
  // Alert details
  title      String
  message    String
  severity   String  // "warning", "critical"
  type       String  // "threshold_violation", "device_offline", "anomaly"
  
  // Status tracking
  status     String @default("active")  // active, acknowledged, resolved
  acknowledgedBy String?
  acknowledgedAt DateTime?
  resolvedAt DateTime?
  
  // Alert history
  attempts   Int @default(0)
  lastNotified DateTime?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([deviceId, status])
  @@index([companyId, status])
  @@index([createdAt])
}

// ============================================
// NOTIFICATIONS
// ============================================

model NotificationQueue {
  id        String   @id @default(uuid())
  
  alert     Alert @relation(fields: [alertId], references: [id], onDelete: Cascade)
  alertId   String
  
  // Notification details
  channel    String  // "email", "sms", "push", "webhook"
  recipient  String  // email address, phone, or webhook URL
  
  // Delivery status
  status     String @default("pending")  // pending, sent, failed
  retries    Int @default(0)
  maxRetries Int @default(3)
  
  sentAt DateTime?
  failureReason String?
  
  createdAt DateTime @default(now())
  
  @@index([alertId, status])
  @@index([status, createdAt])
}

// ============================================
// REPORTS & COMPLIANCE
// ============================================

model ComplianceReport {
  id        String   @id @default(uuid())
  
  company   Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId String
  
  facility  Facility @relation(fields: [facilityId], references: [id], onDelete: Cascade)
  facilityId String
  
  // Report details
  reportType    String  // "daily", "weekly", "monthly", "audit"
  industry      String  // "pharma", "food", "chemical"
  
  // Data
  startDate    DateTime
  endDate      DateTime
  totalReadings Int
  violationCount Int
  downtime      Float?  // in hours
  
  // Compliance status
  isCompliant  Boolean
  remarks      String?
  
  // File storage
  pdfUrl       String?
  excelUrl     String?
  
  createdAt DateTime @default(now())
  generatedAt DateTime @default(now())
  
  @@index([companyId, createdAt])
  @@index([facilityId, createdAt])
}

// ============================================
// SERVICE MANAGEMENT (For Cueron workflow)
// ============================================

model ServiceTicket {
  id        String   @id @default(uuid())
  
  facility  Facility @relation(fields: [facilityId], references: [id], onDelete: Cascade)
  facilityId String
  
  // Ticket details
  title      String
  description String
  problemStatement String?
  
  // Equipment info
  equipmentType String?
  equipmentSerialNo String?
  specificationPhotoUrl String?
  
  // Status
  status     String @default("created")  // created, inspected, quoted, approved, scheduled, completed
  
  // Assignment
  juniorEngineer String?
  seniorEngineer String?
  agencies   Agency[]
  
  // Quotation
  quotationAmount Float?
  quotationScenario String?  // "comprehensive_amc", "service_only", "no_amc"
  
  // Visit
  visitDate  DateTime?
  visitChargeAmount Float?
  inspectionReportUrl String?
  
  // Completion
  completionPhotos String[]  // JSON array of URLs
  completionDate DateTime?
  completionNotes String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([facilityId, status])
  @@index([status])
}

model Agency {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  phone     String
  location  String
  experience Int?  // Years in operations
  
  tickets   ServiceTicket[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ============================================
// ERV SYSTEM (Energy Recovery Ventilation)
// ============================================

model ERVMetrics {
  id        String   @id @default(uuid())
  
  facility  Facility @relation(fields: [facilityId], references: [id], onDelete: Cascade)
  facilityId String
  
  // Temperature readings
  supplyTemp Float     // °C
  exhaustTemp Float    // °C
  
  // Humidity readings
  supplyHumidity Float   // %
  exhaustHumidity Float  // %
  
  // Calculations
  heatRecoveryEfficiency Float?   // %
  moistureRecoveryEfficiency Float? // %
  energySavings Float?  // kWh
  costSavings Float?    // $
  
  timestamp DateTime @default(now())
  
  createdAt DateTime @default(now())
  
  @@index([facilityId, timestamp])
}

// ============================================
// AUDIT LOG
// ============================================

model AuditLog {
  id        String   @id @default(uuid())
  
  userId    String?
  action    String  // "create", "update", "delete", "acknowledge_alert"
  entity    String  // "device", "alert", "threshold"
  entityId  String
  
  oldValues String?  // JSON string
  newValues String?  // JSON string
  
  createdAt DateTime @default(now())
  
  @@index([userId, createdAt])
  @@index([entityId])
}
```

### 1.2 Database Initialization

```bash
# Set DATABASE_URL in .env
# For Neon (serverless PostgreSQL):
# DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/dbname"

# For local PostgreSQL:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/anythingiot"

# Create migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Open Prisma Studio to view data
npx prisma studio
```

---

## 🔌 Phase 2: Backend Implementation

### 2.1 Express Server Setup

Create `server.js`:

```javascript
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));

// Store raw body for HMAC verification
app.use((req, res, next) => {
  let rawBody = '';
  req.on('data', (chunk) => {
    rawBody += chunk.toString('utf8');
  });
  req.on('end', () => {
    req.rawBody = rawBody;
    next();
  });
});

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

const authRoutes = require('./routes/auth');
const sensorRoutes = require('./routes/sensors');
const alertRoutes = require('./routes/alerts');
const deviceRoutes = require('./routes/devices');
const analyticsRoutes = require('./routes/analytics');
const reportRoutes = require('./routes/reports');
const serviceRoutes = require('./routes/services');

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
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Socket.io ready for real-time connections`);
});

module.exports = { app, io, prisma };
```

### 2.2 HMAC Verification Service

Create `services/hmacService.js`:

```javascript
const crypto = require('crypto');

class HMACService {
  constructor(secret) {
    this.secret = secret;
  }

  /**
   * Verify incoming HMAC signature
   * @param {string} rawBody - Raw request body (unparsed JSON)
   * @param {string} timestamp - X-Timestamp header
   * @param {string} receivedSignature - X-Signature header
   * @returns {boolean} - True if signature is valid
   */
  verifySignature(rawBody, timestamp, receivedSignature) {
    // CRITICAL: Formula must match Python sender
    // Formula: HMAC_SHA256(Payload + Timestamp)
    const message = rawBody + timestamp;

    const calculatedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(message)
      .digest('hex');

    return calculatedSignature === receivedSignature;
  }

  /**
   * Generate signature (for testing)
   */
  generateSignature(rawBody, timestamp) {
    const message = rawBody + timestamp;
    return crypto
      .createHmac('sha256', this.secret)
      .update(message)
      .digest('hex');
  }
}

module.exports = new HMACService(process.env.HMAC_SECRET || '9vA3xKp2nR8sL7qW4eY1zU6tH5mJ0cB2');
```

### 2.3 Sensor Ingestion Route

Create `routes/sensors.js`:

```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const hmacService = require('../services/hmacService');
const alertService = require('../services/alertService');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/sensors/ingest
 * 
 * Receives encrypted sensor data from IoT devices
 * Verifies HMAC signature before storing
 * 
 * Headers:
 *   X-Device-Id: Physical device ID
 *   X-Timestamp: Unix timestamp (milliseconds)
 *   X-Signature: HMAC-SHA256 signature
 * 
 * Body:
 *   {
 *     "readings": [
 *       {
 *         "ts": "2025-12-17T10:30:00Z",
 *         "sensor_id": "sensor-123",
 *         "temperature": 23.5,
 *         "humidity": 65.0,
 *         "door_status": "closed"
 *       }
 *     ]
 *   }
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
    // This is passed via dependency injection in routes/sensors.js
    req.app.get('io').to(`device-${deviceId}`).emit('sensor-update', {
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

module.exports = (io) => {
  return router;
};
```

### 2.4 Alert Service

Create `services/alertService.js`:

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AlertService {
  /**
   * Check if sensor reading violates thresholds
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

      if (threshold.metricType === 'door' && reading.door_status) {
        if (threshold.maxValue === 0 && reading.door_status === 'open') {
          isViolating = true;
        }
      }

      if (isViolating) {
        await this.createAlert(device, threshold, reading);
      }
    }
  }

  /**
   * Create alert for threshold violation
   */
  async createAlert(device, threshold, reading) {
    const alert = await prisma.alert.create({
      data: {
        deviceId: device.id,
        companyId: device.companyId,
        title: `${threshold.metricType.toUpperCase()} Threshold Violation`,
        message: `${threshold.metricType} reading ${reading[threshold.metricType]} exceeds threshold`,
        severity: threshold.severity,
        type: 'threshold_violation'
      }
    });

    console.log(`⚠️  Alert created: ${alert.id}`);

    return alert;
  }

  /**
   * Get active alerts for company
   */
  async getActiveAlerts(companyId) {
    return prisma.alert.findMany({
      where: { companyId, status: 'active' },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Acknowledge alert
   */
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

  /**
   * Resolve alert
   */
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
```

---

## ⚛️ Phase 3: Frontend Implementation

### 3.1 React Project Structure

```
anythingiot-frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MetricsCard.jsx
│   │   │   └── RealtimeChart.jsx
│   │   ├── Sensors/
│   │   │   ├── SensorMonitor.jsx
│   │   │   ├── SensorCard.jsx
│   │   │   └── SensorHistory.jsx
│   │   ├── Alerts/
│   │   │   ├── AlertCenter.jsx
│   │   │   ├── AlertItem.jsx
│   │   │   └── AlertThresholds.jsx
│   │   ├── Analytics/
│   │   │   ├── Analytics.jsx
│   │   │   ├── TrendChart.jsx
│   │   │   └── ComplianceMetrics.jsx
│   │   ├── Devices/
│   │   │   ├── DeviceList.jsx
│   │   │   ├── DeviceDetail.jsx
│   │   │   └── DeviceOnboard.jsx
│   │   └── Common/
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       └── Loading.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Layout.jsx
│   │   └── NotFound.jsx
│   ├── hooks/
│   │   ├── useSocket.js
│   │   ├── useSensorData.js
│   │   ├── useAlerts.js
│   │   └── useAuth.js
│   ├── services/
│   │   ├── api.js
│   │   ├── socketService.js
│   │   └── authService.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── SensorContext.jsx
│   ├── styles/
│   │   ├── tailwind.css
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### 3.2 Main App Component

Create `src/App.jsx`:

```jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { SensorContext } from './context/SensorContext';
import socketService from './services/socketService';

// Pages
import Login from './pages/Login';
import Layout from './pages/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import SensorMonitor from './components/Sensors/SensorMonitor';
import AlertCenter from './components/Alerts/AlertCenter';
import Analytics from './components/Analytics/Analytics';
import DeviceList from './components/Devices/DeviceList';

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize socket connection
  useEffect(() => {
    socketService.connect();

    // Listen for real-time sensor updates
    socketService.on('sensor-update', (data) => {
      setSensorData(prev => [...prev, data]);
    });

    // Listen for real-time alerts
    socketService.on('alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAuthUser(data.user);
          } else {
            localStorage.removeItem('token');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user: authUser, setUser: setAuthUser }}>
      <SensorContext.Provider value={{ sensorData, setSensorData, alerts, setAlerts }}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            {authUser ? (
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sensors" element={<SensorMonitor />} />
                <Route path="/alerts" element={<AlertCenter />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/devices" element={<DeviceList />} />
              </Route>
            ) : (
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>
        </Router>
      </SensorContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
```

### 3.3 Real-time Dashboard Component

Create `src/components/Dashboard/Dashboard.jsx`:

```jsx
import React, { useContext, useEffect, useState } from 'react';
import { SensorContext } from '../../context/SensorContext';
import socketService from '../../services/socketService';
import MetricsCard from './MetricsCard';
import RealtimeChart from './RealtimeChart';

function Dashboard() {
  const { sensorData, alerts } = useContext(SensorContext);
  const [liveMetrics, setLiveMetrics] = useState({
    temperature: 0,
    humidity: 0,
    activeAlerts: 0,
    devicesOnline: 0
  });

  useEffect(() => {
    // Subscribe to live metrics
    socketService.emit('subscribe-company', 'company-123');

    // Listen for metric updates
    socketService.on('metrics-update', (metrics) => {
      setLiveMetrics(metrics);
    });

    return () => {
      socketService.off('metrics-update');
    };
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Real-time cold chain monitoring</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricsCard
          title="Temperature"
          value={`${liveMetrics.temperature}°C`}
          trend="↓ 0.5°C"
          color="blue"
        />
        <MetricsCard
          title="Humidity"
          value={`${liveMetrics.humidity}%`}
          trend="→ 65%"
          color="green"
        />
        <MetricsCard
          title="Active Alerts"
          value={liveMetrics.activeAlerts}
          trend="⚠️ 2 critical"
          color="red"
        />
        <MetricsCard
          title="Devices Online"
          value={liveMetrics.devicesOnline}
          trend="✅ All active"
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealtimeChart type="temperature" data={sensorData} />
        <RealtimeChart type="humidity" data={sensorData} />
      </div>

      {/* Recent Alerts */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
        <div className="space-y-3">
          {alerts.slice(0, 5).map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded border-l-4 ${
                alert.severity === 'critical' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
              }`}
            >
              <p className="font-semibold">{alert.title}</p>
              <p className="text-sm text-gray-600">{alert.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
```

---

## 🔌 Phase 4: Real-time Integration

### 4.1 Socket Service

Create `src/services/socketService.js`:

```javascript
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketService();
```

---

## 🔐 Phase 5: IoT Sensor Integration

### 5.1 Python Sensor Client (for testing)

Create `sensor_client/send_encrypted.py`:

```python
import requests
import json
import hmac
import hashlib
import time
import random
from datetime import datetime

# Configuration
API_URL = "http://localhost:5000/api/sensors/ingest"
DEVICE_ID = "sensor-001"
HMAC_SECRET = "9vA3xKp2nR8sL7qW4eY1zU6tH5mJ0cB2"

def generate_signature(payload, timestamp, secret):
    """Generate HMAC-SHA256 signature"""
    message = payload + timestamp
    signature = hmac.new(
        secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return signature

def send_sensor_data():
    """Send encrypted sensor data to backend"""
    
    # Generate sensor readings
    temperature = round(20 + random.uniform(-2, 2), 1)
    humidity = round(60 + random.uniform(-5, 5), 1)
    door_status = random.choice(['open', 'closed'])
    
    # Create payload
    payload = json.dumps({
        "readings": [
            {
                "ts": datetime.now().isoformat() + "Z",
                "sensor_id": DEVICE_ID,
                "temperature": temperature,
                "humidity": humidity,
                "door_status": door_status
            }
        ]
    }, separators=(',', ':'))  # Compact JSON (no spaces)
    
    # Generate timestamp (milliseconds)
    timestamp = str(int(time.time() * 1000))
    
    # Generate signature
    signature = generate_signature(payload, timestamp, HMAC_SECRET)
    
    # Prepare headers
    headers = {
        'X-Device-Id': DEVICE_ID,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
        'Content-Type': 'application/json'
    }
    
    # Send request
    try:
        response = requests.post(API_URL, data=payload, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    print("🚀 Starting sensor data ingestion...")
    while True:
        send_sensor_data()
        time.sleep(5)  # Send every 5 seconds
```

---

## 📊 Phase 6: Analytics & Reporting

### 6.1 Compliance Report Generation

Create `routes/reports.js`:

```javascript
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
    const metrics = {
      totalReadings: sensorData.length,
      violations: sensorData.filter(d => d.temperature > 25 || d.temperature < 15).length,
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
```

---

## 🚀 Phase 7: Deployment & DevOps

### 7.1 Docker Setup

Create `Dockerfile` for backend:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy Prisma schema
COPY prisma ./prisma
RUN npx prisma generate

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: anythingiot
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./anythingiot-backend
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/anythingiot
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      HMAC_SECRET: ${HMAC_SECRET}
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./anythingiot-frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:5000

volumes:
  postgres_data:
```

### 7.2 GitHub Actions CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy AnythingIoT

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Deploy Backend
        run: |
          git push heroku main

      - name: Deploy Frontend
        run: |
          npm run build
          vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 🔐 Risk Mitigation & HMAC Security

### Critical Issues from PDF Analysis

**Risk #1: Raw Body Parsing (HIGHEST PRIORITY)**
```
❌ WRONG - Object may be re-stringified with different formatting
const body = JSON.stringify(req.body);
const isValid = hmacService.verify(body, timestamp, sig);

✅ CORRECT - Use raw unparsed body
const rawBody = req.rawBody;
const isValid = hmacService.verify(rawBody, timestamp, sig);
```

**Risk #2: HMAC Formula Consistency**
```
❌ WRONG - Old C++ formula
HMAC_SHA256(Timestamp + Payload + DeviceID)

✅ CORRECT - Python/Node.js formula
HMAC_SHA256(Payload + Timestamp)
```

**Risk #3: Environment Variable Sync**
```
.env:
HMAC_SECRET=9vA3xKp2nR8sL7qW4eY1zU6tH5mJ0cB2

Ensure this exact value is set in:
• Local .env file
• Vercel environment variables
• Railway/Render environment variables
• Docker secrets
```

**Risk #4: Timestamp Precision**
```
❌ WRONG
const timestamp = Date.now(); // Sometimes loses precision

✅ CORRECT
const timestamp = String(Math.floor(Date.now())); // Always milliseconds
```

---

## 📅 Timeline & Milestones

### Week 1: Foundation
- ✅ PostgreSQL database schema finalized
- ✅ Prisma ORM setup
- ✅ Express server scaffolding
- ✅ HMAC verification implemented
- **Deliverable**: Working sensor ingestion endpoint

### Week 2: Backend Core
- ✅ Alert service & threshold checking
- ✅ Real-time WebSocket setup
- ✅ Authentication (JWT)
- ✅ API routes (sensors, alerts, devices)
- **Deliverable**: Functional backend API

### Week 3: Frontend Development
- ✅ React project setup
- ✅ Dashboard component
- ✅ Sensor monitoring UI
- ✅ Real-time chart integration
- **Deliverable**: Working React frontend

### Week 4: Integration & Advanced Features
- ✅ Socket.io real-time sync
- ✅ Analytics engine
- ✅ Report generation (PDF/Excel)
- ✅ Multi-channel notifications
- **Deliverable**: Fully integrated system

### Week 5: Testing & Deployment
- ✅ Unit tests (Jest)
- ✅ Integration tests
- ✅ Docker setup
- ✅ Deploy to Vercel/Railway
- **Deliverable**: Production-ready system

---

## ✅ Launch Checklist

### Before Going Live

- [ ] Database migrations run successfully
- [ ] All environment variables configured
- [ ] HMAC secret verified across all environments
- [ ] Backend API endpoints tested with Postman
- [ ] WebSocket connection verified
- [ ] Frontend builds without errors
- [ ] SSL/TLS certificates valid
- [ ] Backup strategy in place
- [ ] Logging configured
- [ ] Monitoring (Sentry/New Relic) setup
- [ ] Load testing completed (1000+ concurrent users)
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Deployment runbook created

---

## 📞 Support & Troubleshooting

### Common Issues

**HMAC Validation Fails (401)**
1. Check raw body extraction
2. Verify HMAC_SECRET environment variable
3. Ensure formula is `Payload + Timestamp`
4. Check timestamp precision (milliseconds)

**Socket.io Not Connecting**
1. Check CORS configuration
2. Verify WebSocket port (5000)
3. Check firewall rules
4. Test with `io.on('connect')`

**Sensor Data Not Appearing**
1. Verify device exists in database
2. Check threshold configuration
3. Inspect browser console for errors
4. Test endpoint with curl

**Performance Issues**
1. Add database indexes (Prisma indexes)
2. Implement Redis caching
3. Use Bull queue for background jobs
4. Monitor with `npx prisma studio`

---

## 📚 References

- **PDF Spec**: customer_facing-software-requirement-specification.pdf
- **Sensor Ingestion**: IoT-Sensor-Data-Ingestion.pdf
- **Workflow**: Cueron-workflow.xlsx
- **Tech Stack**: React 19, Node.js, PostgreSQL, Socket.io
- **Security**: HMAC-SHA256, Argon2, JWT

---

## 🎯 Success Metrics

| Metric | Target | Method |
|--------|--------|--------|
| HMAC Validation | 100% success | Logging & monitoring |
| Sensor Latency | <500ms | APM tools |
| Dashboard Updates | <1s | WebSocket metrics |
| System Uptime | 99.9% | Uptime monitoring |
| Alert Delivery | <5s | Alert queue logs |

---

**Document Created**: December 17, 2025  
**Status**: Ready for Development  
**Owner**: Your Development Team  
**Next Step**: Start Phase 1 - Database Setup

