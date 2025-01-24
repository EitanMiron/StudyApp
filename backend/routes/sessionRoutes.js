//use the express router to have access to the app from this file
const express = require('express')

const router = express.Router()

//Create a group session
router.post('/groups/:id/sessions', (req, res) => {
    res.json({mssg: "POST group session "})
})

//GET all group sessions
router.get('/groups/:id/sessions', (req, res) => {
    res.json({mssg: "GET group sessions "})
})

//UPDATE a group session

router.put('/groups/:id/sessions/:sessionId', (req, res) => {
    res.json({mssg: "PUT (update) group session "})
})

//DELETE a group session
router.delete('/groups/:id/sessions/:sessionId', (req, res) => {
    res.json({mssg: " DELETE group session"})
})






module.exports = router