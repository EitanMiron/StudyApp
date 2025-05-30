const Quiz = require('../models/quizModel');
const QuizSubmission = require('../models/quizSubmissionModel');
const Group = require('../models/groupModel');

// Create a quiz
const createQuiz = async (req, res) => {
    try {
        const { title, description, questions, timeLimit, maxAttempts } = req.body;
        const groupId = req.params.id;
        const userId = req.user.id;

        console.log('Creating quiz:', { title, groupId, userId });

        // Check if user is a member of the group
        const group = await Group.findById(groupId).populate('members.userId');
        if (!group) {
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

        const quiz = new Quiz({
            title,
            description,
            questions,
            timeLimit,
            maxAttempts,
            groupId,
            createdBy: userId
        });

        await quiz.save();
        console.log('Quiz created successfully:', quiz._id);
        res.status(201).json(quiz);
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get all quizzes in a study group
const getAllQuizzes = async (req, res) => {
    try {
        const allQuizzes = await Quiz.find({ groupId: req.params.id }).populate('createdBy', 'name email');
        res.status(200).json(allQuizzes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get an individual quiz by ID
const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate('createdBy', 'name email');
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an individual quiz
const deleteQuiz = async (req, res) => {
    try {
        const deletedQuiz = await Quiz.findByIdAndDelete(req.params.quizId);
        if (!deletedQuiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Submit answers for a quiz
const submitQuiz = async (req, res) => {
    try {
        const { answers } = req.body;
        const quizId = req.params.quizId;
        const userId = req.user.id;

        // Get the quiz to check answers
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Calculate score
        let correctAnswers = 0;
        const questions = quiz.questions;
        
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const userAnswer = answers[i];
            
            // Find the correct option for this question
            const correctOption = question.options.find(opt => opt.isCorrect);
            if (correctOption && userAnswer === correctOption._id.toString()) {
                correctAnswers++;
            }
        }

        const score = Math.round((correctAnswers / questions.length) * 100);

        // Save submission
        const submission = new QuizSubmission({
            quiz: quizId,
            user: userId,
            answers,
            score,
            completedAt: new Date()
        });

        await submission.save();

        // Update quiz submissions array
        if (!quiz.submissions) {
            quiz.submissions = [];
        }
        
        // Add or update the user's submission
        const existingSubmissionIndex = quiz.submissions.findIndex(
            sub => sub.user.toString() === userId
        );

        if (existingSubmissionIndex >= 0) {
            quiz.submissions[existingSubmissionIndex] = {
                user: userId,
                status: 'completed',
                score,
                submittedAt: new Date()
            };
        } else {
            quiz.submissions.push({
                user: userId,
                status: 'completed',
                score,
                submittedAt: new Date()
            });
        }

        await quiz.save();

        res.status(200).json({ 
            message: 'Quiz submitted successfully', 
            score,
            submission: {
                _id: submission._id,
                score,
                completedAt: submission.completedAt
            }
        });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get quiz results
const getQuizResults = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const userId = req.user.id;

        // Get the quiz
        const quiz = await Quiz.findById(quizId).populate('createdBy', 'name email');
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Get the user's submission
        const submission = await QuizSubmission.findOne({ quiz: quizId, user: userId });
        if (!submission) {
            return res.status(404).json({ error: 'Quiz results not found' });
        }

        // Format the response
        const result = {
            _id: submission._id,
            quiz: {
                _id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                questions: quiz.questions.map((q, index) => ({
                    _id: q._id,
                    questionText: q.questionText,
                    options: q.options,
                    userAnswer: submission.answers[index],
                    isCorrect: submission.answers[index] === q.correctAnswer
                }))
            },
            score: submission.score,
            totalQuestions: quiz.questions.length,
            completedAt: submission.completedAt
        };

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getting quiz results:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    createQuiz, 
    getAllQuizzes, 
    getQuizById, 
    deleteQuiz, 
    submitQuiz,
    getQuizResults 
};
