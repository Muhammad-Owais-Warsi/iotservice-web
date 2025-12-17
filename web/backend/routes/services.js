const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: "Get services logic to be implemented" });
});

module.exports = router;
