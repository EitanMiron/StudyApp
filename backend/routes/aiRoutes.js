const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/aiController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/chat', authenticateToken, handleChat);

module.exports = router; 