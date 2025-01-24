//use the express router to have access to the app from this file
const express = require('express')

const router = express.Router()

//register account
router.post('/register', (req, res) => {
    res.json({mssg: "POST register"})
})

//login account
router.post('/login', (req, res) => {
    res.json({mssg: "POST login"})
})

//logout account
router.post('/logout', (req, res) => {
    res.json({mssg: "POST logout"})
})

//get current user
router.get('/me', (req, res) => {
    res.json({mssg: "GET current user"})
})

//register account
router.post('/refresh', (req, res) => {
    res.json({mssg: "POST refresh token"})
})


module.exports = router