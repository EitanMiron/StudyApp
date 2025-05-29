const express = require('express');
const router = express.Router();
const { 
    getAdminDashboard,
    getAdminUsers,
    getAdminGroups,
    getAdminContent,
    getAdminAnalytics 
} = require('../controllers/adminController');
const authenticateToken = require('../middleware/authenticateToken');

// Dashboard route
router.get('/dashboard', authenticateToken, getAdminDashboard);

// User management routes
router.get('/users', authenticateToken, getAdminUsers);

// Group management routes
router.get('/groups', authenticateToken, getAdminGroups);

// Content management routes
router.get('/content', authenticateToken, getAdminContent);

// Analytics routes
router.get('/analytics', authenticateToken, getAdminAnalytics);

module.exports = router;