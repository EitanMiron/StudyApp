const Quiz = require('../models/quizModel');

// Create a quiz
const createQuiz = async (req, res) => {
    const { groupId, title, description, questions, createdBy } = req.body;

    try {
        const newQuiz = new Quiz({
            groupId,
            title,
            description,
            questions,
            createdBy,
        });

        await newQuiz.save();
        res.status(201).json(newQuiz);
    } catch (error) {
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
    res.json({ message: 'Quiz submitted successfully (implement grading logic here)' });
};

module.exports = { createQuiz, getAllQuizzes, getQuizById, deleteQuiz, submitQuiz };
