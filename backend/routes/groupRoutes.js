//use the express router to have access to the app from this file
const express = require('express')

const Group = require('../models/groupModel')
const router = express.Router()

//GET all study Groups
router.get('/groups', async (req, res) => {
    try {
        const groups = await Group.find()
        res.status(200).json(groups)
    } catch(error) {
        res.status(500).json({error: error.message})
    }
})

//GET a single study group
router.get('/groups/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
        if(!group) {
            return res.status(404).json({error: 'Group not found'})
        }
        res.status(200).json(group)
    }catch (error) {
        res.status(500).json({error: error.message})
    }
})

//POST(create) a new study group
router.post('/groups', async (req, res) => {
    const {name, subject, description, members} = req.body 

    try {
        const newGroup = new Group({name, subject, description, members})
        await newGroup.save()
        res.status(201).json(newGroup)
    }catch(error){
        res.status(500).json({error: error.message})
    }
})

//PUT (update) a study group
router.put('/groups/:id', async (req, res) => {
    try {
        const updatedGroup = await Group.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        if(!updatedGroup){
            return res.status(404).json({error: 'Group not found(trying to update)'})
        }
        res.status(200).json(updatedGroup)
    }catch(error){
        res.status(400).json({error: error.message})
    }
})

//DELETE a study group
router.delete('/groups/:id', async (req, res) => {
    try{
        const deletedGroup = await Group.findByIdAndDelete(req.params.id)
        if(!deletedGroup){
            return res.status(404).json({error: 'group not found'})
        }
        res.status(200).json({message: 'Group deleted succesfully'})
    }catch(error){
        res.status(500).json({error: error.message})
    }
})

module.exports = router