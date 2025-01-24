//use the express router to have access to the app from this file
const express = require('express')

const router = express.Router()

//create a quiz
router.post('/groups/:id/quizzes', (req, res) => {
    res.json({mssg: "POST (create) a quiz"})
})

//get all quizzes
router.get('/groups/:id/quizzes', (req, res) => {
    res.json({mssg: "GET all quizzes"})
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