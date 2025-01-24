//use the express router to have access to the app from this file
const express = require('express')

const router = express.Router()

//POST (create) a resource
router.post('/groups/:id/resources', (req, res) => {
    res.json({mssg: "Resource Create"})
})

//GET all resources
router.get('/groups/:id/resources', (req, res) => {
    res.json({mssg: "GET resources"})
})

//DELETE a resource

router.delete('groups/:id/resources/:resourceId', (req, res) => {
    res.json({mssg: "DELETE resource"})
})
module.exports = router