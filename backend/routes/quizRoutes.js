//use the express router to have access to the app from this file
const express = require('express')

const Quiz = require('../models/quizModel');
const { find } = require('../models/authModel');

const router = express.Router()

//create a quiz
router.post('/groups/:id/quizzes', async (req, res) => {
    const {groupId, title, description, questions, createdBy} = req.body;

    try {
        const newQuiz = new Quiz({
            groupId,
            description,
            questions,
            createdBy,
        });

        await newQuiz.save();
        res.status(201).json(newQuiz);
    }
    catch (error) {
        res.status(400).json({error: error.message});
    }
})

//get all quizzes
router.get('/groups/:id/quizzes', (req, res) => {
    try {
        const allQuizzes = Quiz.find({groupId: req.params.id}).populate('createdAt', 'name email');
    }
    catch (error) {

    }
})    

//get an individual quiz
router.get('/groups/:id/quizzes/quizId', (req, res) => {
    res.json({mssg: "GET an individual quiz"})
})

//delete an individual quiz
router.delete('/groups/:id/quizzes/:quizId', (req, res) => {
    res.json({mssg: "DELETE a quiz"})
})

//submit answers for an individual quiz

router.post('/groups/:id/quizzes/:quizId/submit', (req, res) => {
    res.json({mssg: "Submit quiz"})
})


module.exports = router