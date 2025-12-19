const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const prisma = require('../utils/prismaClient');
const { loginSchema, registerSchema } = require('../middleware/ValidatorsAuth');
const { identifer } = require('../middleware/identifier');

// ============================================
// LOGIN
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        // Check suspension status
        if (user.status === 'suspended') {
            return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
        }

        // Check if approved (for Masters and Employees)
        if (!user.isApproved && user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Your account is pending approval by the Admin.' });
        }

        const validPassword = await argon2.verify(user.password, password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, companyId: user.companyId },
            process.env.SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                companyId: user.companyId
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// REGISTER MASTER (Admin Only)
// ============================================
router.post('/register-master', identifer(['ADMIN']), async (req, res) => {
    try {
        const { email, password, firstName, lastName, companyId } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await argon2.hash(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'MASTER',
                companyId,
                isApproved: true // Admin-created Masters are pre-approved
            }
        });

        res.status(201).json({ success: true, user: { id: user.id, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// REGISTER EMPLOYEE (Master Only)
// ============================================
router.post('/register-employee', identifer(['MASTER']), async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await argon2.hash(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'EMPLOYEE',
                companyId: req.user.companyId,
                isApproved: false // Needs Admin approval
            }
        });

        res.status(201).json({
            success: true,
            message: 'Employee registered. Pending Admin approval.',
            user: { id: user.id, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// APPROVE EMPLOYEE (Admin Only)
// ============================================
router.post('/approve/:id', identifer(['ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.update({
            where: { id },
            data: { isApproved: true }
        });
        res.json({ success: true, message: 'User approved successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// SUSPEND USER (Admin or Master)
// ============================================
router.post('/suspend/:id', identifer(['ADMIN', 'MASTER']), async (req, res) => {
    try {
        const { id } = req.params;
        const targetUser = await prisma.user.findUnique({ where: { id } });

        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        // Logic check: Master can only suspend Employee of their own company
        if (req.user.role === 'MASTER') {
            if (targetUser.role !== 'EMPLOYEE' || targetUser.companyId !== req.user.companyId) {
                return res.status(403).json({ error: 'You only have permission to suspend Employees in your company' });
            }
        }

        // Admin can suspend anyone (except maybe themselves, but let's stick to prompt)

        await prisma.user.update({
            where: { id },
            data: { status: 'suspended' }
        });

        res.json({ success: true, message: 'User suspended successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// VERIFY TOKEN
// ============================================
router.get('/verify', identifer(), async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user || user.status === 'suspended') {
            return res.json({ success: false, message: 'Token invalid or user suspended' });
        }
        res.json({ success: true, user: req.user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
