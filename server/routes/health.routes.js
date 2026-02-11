const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
    res.json({
        message: 'Health API is running',
        status: "success"
    })
});

module.exports = router;