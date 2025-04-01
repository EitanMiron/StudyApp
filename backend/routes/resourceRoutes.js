//use the express router to have access to the app from this file
const express = require('express')

const Resource = require('../models/resourceModel')


const router = express.Router()

//POST (create) a resource
router.post('/groups/:id/resources', async (req, res) => {
    const {groupId, title, url, uploadedBy} = req.body

    try {
        const existingResource = await Resource.findOne({title})
        if(existingResource) return res.status(400).json({message: "Resource already exists"});

        const newResource = new Resource ({groupId, title, url, uploadedBy});
        await newResource.save();
        res.status(201).json(newResource);

    } catch(error) {
        res.status(500).json({error: error.message})
    }
})

//GET all resources
router.get('/groups/:id/resources', async (req, res) => {

    try {
        const resources = await Resource.find({groupId: req.params.id}).populate('createdBy', 'name email');
        if(!resources) {
            return res.status(404).json({error: "Resources not found"});
        }
        res.status(200).json(resources);
    }
    catch (error) {
        res.status(500).json({error: error.message})
    }
})

//Get a single resource
router.get('/groups/:id/resources/:resourceId', async (req, res) => {

    try {
        const resource = await Resource.findById(req.params.id).populate('createdBy', 'name email');
        if(!resource)
            return res.status(404).json({error: "Resource not found"});
        
        res.status(200).json(resource)
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
})

//DELETE a resource

router.delete('groups/:id/resources/:resourceId', async (req, res) => {
    try {
        const deletedResource = await Resource.findByIdAndDelete(req.params.id);
        if(!deletedResource)
            return res.status(404).json({error: "Could not find resource to be deleted."});

        res.status(200).json({message: "Resource deleted succsesfully!"});
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
})
module.exports = router