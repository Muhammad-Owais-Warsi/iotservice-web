const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: "Get devices logic to be implemented" });
});

router.post('/register', (req, res) => {
    res.json({ message: "Register device logic to be implemented" });
});

module.exports = router;
