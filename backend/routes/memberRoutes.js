//use the express router to have access to the app from this file
const express = require('express')

const router = express.Router()

//GET a group member
router.get('/groups/:id/members', (req, res) => {
    res.json({mssg: "GET a group member"})
})

//POST(create) a new group member
router.post('/groups/:id/members', (req, res) => {
    res.json({mssg: 'POST(create) a new group member'})
})

//DELETE a group member
router.delete('/groups/:id/members/:userID', (req, res) => {
    res.json({mssg: 'DELETE a group member'})
})

module.exports = router