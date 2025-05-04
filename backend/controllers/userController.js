const User = require('../models/authModel');
const Group = require('../models/groupModel');
const Quiz = require('../models/quizModel');
const Note = require('../models/noteModel');
const Resource = require('../models/resourceModel');

// Get user dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming user is authenticated and ID is available

        // Get enrolled groups count
        const enrolledGroups = await Group.countDocuments({ members: userId });

        // Get completed quizzes count
        const completedQuizzes = await Quiz.countDocuments({ 
            'submissions.userId': userId,
            'submissions.status': 'completed'
        });

        // Get total notes count
        const totalNotes = await Note.countDocuments({ userId });

        // Get total resources count
        const totalResources = await Resource.countDocuments();

        // Get upcoming deadlines (example: quizzes with due dates)
        const upcomingDeadlines = await Quiz.find({
            dueDate: { $gt: new Date() }
        }).select('title type dueDate').limit(5);

        res.status(200).json({
            enrolledGroups,
            completedQuizzes,
            totalNotes,
            totalResources,
            upcomingDeadlines: upcomingDeadlines.map(quiz => ({
                id: quiz._id,
                title: quiz.title,
                type: 'Quiz',
                dueDate: quiz.dueDate
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getDashboardStats }; 