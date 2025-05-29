const express = require('express');
const router = express.Router();
const { 
    getUserDashboard,
    getUserGroups,
    getUserNotes,
    getUserQuizzes,
    getUserResources 
} = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');

// Dashboard route
router.get('/dashboard', authenticateToken, getUserDashboard);

// Study Groups routes
router.get('/groups', authenticateToken, getUserGroups);

// Notes routes
router.get('/notes', authenticateToken, getUserNotes);

// Quizzes routes
router.get('/quizzes', authenticateToken, getUserQuizzes);

// Resources routes
router.get('/resources', authenticateToken, getUserResources);

module.exports = router;