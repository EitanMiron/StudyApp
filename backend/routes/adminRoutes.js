const express = require('express');
const router = express.Router();
const { 
    getAdminDashboard,
    getAdminUsers,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    getUserStats,
    getAdminGroups,
    updateGroup,
    deleteGroup,
    getAdminContent,
    getAdminAnalytics 
} = require('../controllers/adminController');
const authenticateToken = require('../middleware/authenticateToken');

// Dashboard route
router.get('/dashboard', authenticateToken, getAdminDashboard);

// User management routes
router.get('/users', authenticateToken, getAdminUsers);
router.put('/users/:userId', authenticateToken, updateUser);
router.delete('/users', authenticateToken, bulkDeleteUsers);
router.delete('/users/:userId', authenticateToken, deleteUser);
router.get('/users/:userId/stats', authenticateToken, getUserStats);

// Group management routes
router.get('/groups', authenticateToken, getAdminGroups);
router.put('/groups/:groupId', authenticateToken, updateGroup);
router.delete('/groups/:groupId', authenticateToken, deleteGroup);

// Content management routes
router.get('/content', authenticateToken, getAdminContent);

// Analytics routes
router.get('/analytics', authenticateToken, getAdminAnalytics);

module.exports = router;