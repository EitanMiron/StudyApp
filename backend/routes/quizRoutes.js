const express = require('express');
const quizController = require('../controllers/quizController');
const { authenticateToken } = require('../middleware/authMiddleware');
const Quiz = require('../models/quizModel');
const Group = require('../models/groupModel');

const router = express.Router();

// Create a quiz
router.post('/groups/:id/quizzes', authenticateToken, quizController.createQuiz);

// Get all quizzes in a study group
router.get('/groups/:id/quizzes', authenticateToken, quizController.getAllQuizzes);

// Get an individual quiz by ID
router.get('/groups/:id/quizzes/:quizId', authenticateToken, quizController.getQuizById);

// Delete an individual quiz
router.delete('/groups/:id/quizzes/:quizId', authenticateToken, quizController.deleteQuiz);

// Submit quiz answers
router.post('/groups/:groupId/quizzes/:quizId/submit', authenticateToken, async (req, res) => {
    try {
        const { groupId, quizId } = req.params;
        const { answers, attemptNumber } = req.body;
        const userId = req.user.id;

        console.log('Submitting quiz:', { groupId, quizId, userId, attemptNumber, answers });

        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            console.log('Quiz not found:', quizId);
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check if user is a member of the group
        const group = await Group.findById(groupId).populate('members.userId');
        if (!group) {
            console.log('Group not found:', groupId);
            return res.status(404).json({ message: 'Group not found' });
        }

        console.log('Group members:', group.members);

        const isMember = group.members.some(member => {
            const memberId = member.userId ? member.userId._id.toString() : member.userId;
            return memberId === userId && (member.role === 'member' || member.role === 'admin');
        });

        if (!isMember) {
            console.log('User not a member:', { userId, groupId });
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        // Check if user has exceeded max attempts
        const userSubmissions = quiz.submissions.filter(
            submission => submission.user.toString() === userId
        );
        if (userSubmissions.length >= quiz.maxAttempts) {
            console.log('Max attempts reached:', { userId, attempts: userSubmissions.length, maxAttempts: quiz.maxAttempts });
            return res.status(400).json({ message: 'Maximum number of attempts reached' });
        }

        // Calculate score
        let correctAnswers = 0;
        console.log('Quiz questions:', quiz.questions);
        
        // Since answers is an array, we'll check each answer against the corresponding question
        quiz.questions.forEach((question, index) => {
            const userAnswer = answers[index];
            console.log('Checking question:', {
                questionId: question._id,
                userAnswer,
                options: question.options
            });
            
            const correctOption = question.options.find(option => option.isCorrect);
            console.log('Correct option:', correctOption);
            
            if (userAnswer && correctOption && userAnswer === correctOption._id.toString()) {
                correctAnswers++;
                console.log('Correct answer found!');
            }
        });

        const score = Math.round((correctAnswers / quiz.questions.length) * 100);
        console.log('Score calculation:', { correctAnswers, totalQuestions: quiz.questions.length, score });

        // Create or update submission
        const submission = {
            user: userId,
            status: 'completed',
            score,
            submittedAt: new Date(),
            answers: answers.map((answer, index) => ({
                questionId: quiz.questions[index]._id,
                selectedOption: answer,
                isCorrect: answer === quiz.questions[index].options.find(opt => opt.isCorrect)?._id.toString()
            }))
        };

        // Update quiz with new submission
        await Quiz.findByIdAndUpdate(quizId, {
            $push: { submissions: submission }
        });

        console.log('Quiz submitted successfully:', { userId, quizId, score });
        res.json({ message: 'Quiz submitted successfully', score });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
    }
});

// Get quiz results
router.get('/groups/:groupId/quizzes/:quizId/results', authenticateToken, async (req, res) => {
    try {
        const { groupId, quizId } = req.params;
        const userId = req.user.id;

        // Find the quiz
        const quiz = await Quiz.findById(quizId)
            .populate('createdBy', 'name')
            .populate('groupId', '_id');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check if user is a member of the group
        const group = await Group.findById(groupId).populate('members.userId');
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const isMember = group.members.some(member => {
            const memberId = member.userId ? member.userId._id.toString() : member.userId;
            return memberId === userId && (member.role === 'member' || member.role === 'admin');
        });

        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        // Filter submissions for the current user
        const userSubmissions = quiz.submissions.filter(
            submission => submission.user.toString() === userId
        );

        // Sort submissions by submission date (newest first)
        userSubmissions.sort((a, b) => 
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );

        // Create response object with quiz details and user's submissions
        const response = {
            ...quiz.toObject(),
            submissions: userSubmissions
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching quiz results:', error);
        res.status(500).json({ message: 'Failed to fetch quiz results' });
    }
});

// Delete a quiz
router.delete('/groups/:groupId/quizzes/:quizId', authenticateToken, async (req, res) => {
    try {
        const { groupId, quizId } = req.params;
        const userId = req.user.id;

        console.log('Deleting quiz:', { groupId, quizId, userId });

        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            console.log('Quiz not found:', quizId);
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check if user is a member of the group
        const group = await Group.findById(groupId).populate('members.userId');
        if (!group) {
            console.log('Group not found:', groupId);
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is admin or quiz creator
        const isAdmin = group.members.some(member => {
            const memberId = member.userId ? member.userId._id.toString() : member.userId;
            return memberId === userId && member.role === 'admin';
        });

        const isCreator = quiz.createdBy.toString() === userId;

        if (!isAdmin && !isCreator) {
            console.log('User not authorized:', { userId, groupId });
            return res.status(403).json({ message: 'Only admins or quiz creators can delete quizzes' });
        }

        // Delete the quiz
        await Quiz.findByIdAndDelete(quizId);
        console.log('Quiz deleted successfully:', quizId);
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ message: 'Failed to delete quiz', error: error.message });
    }
});

module.exports = router;
