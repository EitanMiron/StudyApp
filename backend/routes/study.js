//use the express router to have access to the app from this file
const express = require('express')

const router = express.Router()

//GET all study Groups
router.get('/groups', (req, res) => {
    res.json({mssg: 'Get all study groups'})
})

//GET a single study group
router.get('/groups/:id', (req, res) => {
    res.json({mssg: "GET a single study group"})
})

//POST(create) a new study group
router.post('/groups', (req, res) => {
    res.json({mssg: 'POST(create) a new study group'})
})

//PUT (update) a study group
router.put('/groups/:id', (req, res) => {
    res.json({mssg: 'PUT(update) study group'})
})

//DELETE a study group
router.delete('/groups/:id', (req, res) => {
    res.json({mssg: 'DELETE a study group'})
})

module.exports = router