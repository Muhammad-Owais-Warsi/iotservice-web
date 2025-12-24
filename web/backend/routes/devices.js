const express = require('express');
const router = express.Router();
const prisma = require('../utils/prismaClient');
const { identifer } = require('../middleware/identifier');

router.get('/', identifer(), async (req, res) => {
    try {
        const devices = await prisma.device.findMany({
            include: { facility: true }
        });
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/register', (req, res) => {
    res.json({ message: "Register device logic to be implemented" });
});

module.exports = router;
