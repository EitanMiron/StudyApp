//use the express router to have access to the app from this file
const express = require('express')

const router = express.Router()

//creates a new note
router.post('/groups/:id/notes', (req, res) => {
    res.json({mssg: "POST (create) a note"})

})

//attains a note
router.get('/groups/:id/notes', (req, res) => {
    res.json({mssg: "GET a note"})

})

//updates a given note
router.put('/groups/:id/notes/noteID', (req, res) => {
    res.json({mssg: "PUT (update) a note"})
})

//delete a note
router.delete('/groups/:id/notes/noteID', (req, res) => {
    res.json({mssg: "Delete a note"})
})    



module.exports = router