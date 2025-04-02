const Resource = require('../models/resourceModel');

// Create a new resource
const createResource = async (req, res) => {
    const { groupId, title, url, uploadedBy } = req.body;

    try {
        const existingResource = await Resource.findOne({ title });
        if (existingResource) return res.status(400).json({ message: "Resource already exists" });

        const newResource = new Resource({ groupId, title, url, uploadedBy });
        await newResource.save();
        res.status(201).json(newResource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all resources in a study group
const getAllResources = async (req, res) => {
    try {
        const resources = await Resource.find({ groupId: req.params.id }).populate('uploadedBy', 'name email');
        if (!resources.length) {
            return res.status(404).json({ error: "No resources found" });
        }
        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single resource by ID
const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.resourceId).populate('uploadedBy', 'name email');
        if (!resource) return res.status(404).json({ error: "Resource not found" });

        res.status(200).json(resource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a resource
const deleteResource = async (req, res) => {
    try {
        const deletedResource = await Resource.findByIdAndDelete(req.params.resourceId);
        if (!deletedResource) return res.status(404).json({ error: "Resource not found" });

        res.status(200).json({ message: "Resource deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createResource, getAllResources, getResourceById, deleteResource };
