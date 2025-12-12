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
const Deadline = require('../models/deadlineModel');

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

// Temporary route to create test deadlines (remove after testing)
router.post('/create-test-deadlines', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Create a test deadline for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const testDeadline1 = new Deadline({
            title: 'Test Assignment',
            description: 'This is a test assignment to verify the upcoming deadlines feature',
            type: 'assignment',
            dueDate: tomorrow,
            user: userId,
            priority: 'high',
            isCompleted: false
        });

        // Create a deadline for next week
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const testDeadline2 = new Deadline({
            title: 'Test Quiz',
            description: 'This is a test quiz for next week',
            type: 'quiz',
            dueDate: nextWeek,
            user: userId,
            priority: 'medium',
            isCompleted: false
        });

        // Create an urgent deadline for today
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        const testDeadline3 = new Deadline({
            title: 'Urgent Project',
            description: 'This is an urgent project due today',
            type: 'project',
            dueDate: today,
            user: userId,
            priority: 'high',
            isCompleted: false
        });

        await Promise.all([
            testDeadline1.save(),
            testDeadline2.save(),
            testDeadline3.save()
        ]);

        res.status(201).json({ 
            message: 'Test deadlines created successfully',
            deadlines: [testDeadline1, testDeadline2, testDeadline3]
        });
    } catch (error) {
        console.error('Error creating test deadlines:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User Deadlines CRUD
router.get('/deadlines', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const deadlines = await Deadline.find({ user: userId }).sort('dueDate');
        res.status(200).json(deadlines);
    } catch (error) {
        console.error('Error fetching deadlines:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/deadlines', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, type, dueDate, priority, status } = req.body;
        const deadline = new Deadline({
            title,
            description,
            type: type || 'other',
            dueDate,
            user: userId,
            priority: priority || 'medium',
            status: status || 'Not Ready',
            isCompleted: false
        });
        await deadline.save();
        res.status(201).json(deadline);
    } catch (error) {
        console.error('Error creating deadline:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/deadlines/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, description, type, dueDate, priority, status, isCompleted } = req.body;
        const deadline = await Deadline.findOneAndUpdate(
            { _id: id, user: userId },
            { title, description, type, dueDate, priority, status, isCompleted },
            { new: true }
        );
        if (!deadline) return res.status(404).json({ message: 'Deadline not found' });
        res.status(200).json(deadline);
    } catch (error) {
        console.error('Error updating deadline:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/deadlines/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const deadline = await Deadline.findOneAndDelete({ _id: id, user: userId });
        if (!deadline) return res.status(404).json({ message: 'Deadline not found' });
        res.status(200).json({ message: 'Deadline deleted successfully' });
    } catch (error) {
        console.error('Error deleting deadline:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;