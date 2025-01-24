//use the express router to have access to the app from this file
const express = require('express')

const router = express.Router()

//GET the user
router.get('/users/:id', (req, res) => {
    res.json({mssg: "GET user"})
})

//PUT(update) the user
router.put('/users/:id', (req, res) => {
    res.json({mssg: "PUT (update) user"})
})


module.exports = router