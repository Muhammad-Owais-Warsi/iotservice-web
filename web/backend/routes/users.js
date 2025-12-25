const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const prisma = require('../utils/prismaClient');
const { identifer } = require('../middleware/identifier');

// ============================================
// GET ALL USERS (Admin Only - with filters)
// ============================================
router.get('/', identifer(['CUERON_ADMIN']), async (req, res) => {
    try {
        const { role, companyId, status } = req.query;

        const where = {};
        if (role) where.role = role;
        if (companyId) where.companyId = companyId;
        if (status) where.status = status;

        const users = await prisma.user.findMany({
            where,
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        industry: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Remove passwords from response
        const sanitizedUsers = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json({ success: true, users: sanitizedUsers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// GET COMPANY EMPLOYEES (Master Only)
// ============================================
router.get('/company-employees', identifer(['MASTER']), async (req, res) => {
    try {
        const employees = await prisma.user.findMany({
            where: {
                companyId: req.user.companyId,
                role: 'EMPLOYEE'
            },
            orderBy: { createdAt: 'desc' }
        });

        const sanitizedEmployees = employees.map(emp => {
            const { password, ...empWithoutPassword } = emp;
            return empWithoutPassword;
        });

        res.json({ success: true, employees: sanitizedEmployees });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// CREATE MASTER ACCOUNT (Admin Only)
// ============================================
router.post('/create-master', identifer(['CUERON_ADMIN']), async (req, res) => {
    try {
        const { email, password, firstName, lastName, companyId } = req.body;

        // Validate required fields
        if (!email || !password || !companyId) {
            return res.status(400).json({ error: 'Email, password, and companyId are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Verify company exists
        const company = await prisma.company.findUnique({ where: { id: companyId } });
        if (!company) {
            return res.status(400).json({ error: 'Company not found' });
        }

        const hashedPassword = await argon2.hash(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'MASTER',
                companyId,
                isApproved: true,
                status: 'active'
            },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        industry: true
                    }
                }
            }
        });

        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
            success: true,
            message: 'Master account created successfully',
            user: userWithoutPassword
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// CREATE EMPLOYEE (Master Only)
// ============================================
router.post('/create-employee', identifer(['MASTER']), async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = await argon2.hash(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'EMPLOYEE',
                companyId: req.user.companyId,
                isApproved: true, // Master can directly approve their employees
                status: 'active'
            }
        });

        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            user: userWithoutPassword
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// SUSPEND USER
// ============================================
router.patch('/suspend/:id', identifer(['CUERON_ADMIN', 'MASTER']), async (req, res) => {
    try {
        const { id } = req.params;
        const targetUser = await prisma.user.findUnique({
            where: { id },
            include: { company: true }
        });

        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Role-based permission check
        if (req.user.role === 'MASTER') {
            // Masters can only suspend employees in their company
            if (targetUser.role !== 'EMPLOYEE' || targetUser.companyId !== req.user.companyId) {
                return res.status(403).json({
                    error: 'You can only suspend employees in your company'
                });
            }
        }
        // CUERON_ADMIN can suspend anyone (MASTER or EMPLOYEE)

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { status: 'suspended' },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        industry: true
                    }
                }
            }
        });

        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json({
            success: true,
            message: 'User suspended successfully',
            user: userWithoutPassword
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// REACTIVATE USER
// ============================================
router.patch('/reactivate/:id', identifer(['CUERON_ADMIN', 'MASTER']), async (req, res) => {
    try {
        const { id } = req.params;
        const targetUser = await prisma.user.findUnique({
            where: { id },
            include: { company: true }
        });

        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Role-based permission check
        if (req.user.role === 'MASTER') {
            if (targetUser.role !== 'EMPLOYEE' || targetUser.companyId !== req.user.companyId) {
                return res.status(403).json({
                    error: 'You can only reactivate employees in your company'
                });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { status: 'active' },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        industry: true
                    }
                }
            }
        });

        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json({
            success: true,
            message: 'User reactivated successfully',
            user: userWithoutPassword
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// GET ALL COMPANIES (Admin Only)
// ============================================
router.get('/companies', identifer(['CUERON_ADMIN']), async (req, res) => {
    try {
        const companies = await prisma.company.findMany({
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        status: true,
                        isApproved: true
                    }
                },
                facilities: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        type: true
                    }
                },
                devices: {
                    select: {
                        id: true,
                        name: true,
                        deviceId: true,
                        status: true
                    }
                },
                _count: {
                    select: {
                        users: true,
                        facilities: true,
                        devices: true,
                        alerts: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, companies });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// CREATE COMPANY (Admin Only)
// ============================================
router.post('/companies', identifer(['CUERON_ADMIN']), async (req, res) => {
    try {
        const { name, industry } = req.body;

        if (!name || !industry) {
            return res.status(400).json({ error: 'Name and industry are required' });
        }

        const company = await prisma.company.create({
            data: {
                name,
                industry
            }
        });

        res.status(201).json({
            success: true,
            message: 'Company created successfully',
            company
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
