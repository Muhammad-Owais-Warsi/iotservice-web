const express = require('express');
const router = express.Router();

module.exports = (io) => {
    router.get('/', (req, res) => {
        res.json({ message: "Get alerts logic to be implemented" });
    });

    router.post('/create', (req, res) => {
        res.json({ message: "Create alert logic to be implemented" });
    });

    return router;
};
