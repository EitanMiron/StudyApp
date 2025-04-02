const express = require('express');
const quizController = require('../controllers/quizController');

const router = express.Router();

// Create a quiz
router.post('/groups/:id/quizzes', quizController.createQuiz);

// Get all quizzes in a study group
router.get('/groups/:id/quizzes', quizController.getAllQuizzes);

// Get an individual quiz by ID
router.get('/groups/:id/quizzes/:quizId', quizController.getQuizById);

// Delete an individual quiz
router.delete('/groups/:id/quizzes/:quizId', quizController.deleteQuiz);

// Submit answers for an individual quiz
router.post('/groups/:id/quizzes/:quizId/submit', quizController.submitQuiz);

module.exports = router;
