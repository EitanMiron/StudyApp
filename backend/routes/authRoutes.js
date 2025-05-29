const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Register Account
router.post('/register', authController.register);

// Login Account
router.post('/login', authController.login);

// Logout Account
router.post('/logout', authController.logout);

// Get Current User
router.get('/me', authController.getCurrentUser);

// Get all users
router.get('/all', authController.getAllUsers);

// Refresh Token
router.post('/refresh', authController.refreshToken);

module.exports = router;
