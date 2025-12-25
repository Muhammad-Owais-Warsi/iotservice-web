const express = require('express');
const router = express.Router();

const { identifer } = require('../middleware/identifier');

router.get('/dashboard', identifer(), (req, res) => {
    res.json({ message: "Analytics dashboard logic to be implemented", role: req.user.role });
});

module.exports = router;
