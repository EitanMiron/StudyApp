const Resource = require('../models/resourceModel');
const User = require('../models/authModel'); // Import the User model

// Create a new resource
const createResource = async (req, res) => {
    const { groupId, title, url, type, description } = req.body;
    const userId = req.user._id;

    try {
        const existingResource = await Resource.findOne({ title, groupId });
        if (existingResource) return res.status(400).json({ message: "Resource already exists in this group" });

        const newResource = new Resource({ 
            groupId, 
            title, 
            url, 
            type: type || 'link',
            description,
            uploadedBy: userId 
        });
        await newResource.save();
        
        const populatedResource = await Resource.findById(newResource._id)
            .populate('uploadedBy', 'name email')
            .exec();
        res.status(201).json(populatedResource);
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all resources in a study group
const getAllResources = async (req, res) => {
    try {
        const resources = await Resource.find({ groupId: req.params.id })
            .populate('uploadedBy', 'name email')
            .exec();
        res.status(200).json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get a single resource by ID
const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.resourceId)
            .populate('uploadedBy', 'name email')
            .exec();
        if (!resource) return res.status(404).json({ error: "Resource not found" });

        res.status(200).json(resource);
    } catch (error) {
        console.error('Error fetching resource:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update a resource
const updateResource = async (req, res) => {
    const { title, url, type, description } = req.body;
    const { resourceId } = req.params;
    const userId = req.user._id;

    try {
        // Find the resource first to check permissions
        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ error: "Resource not found" });
        }

        // Check if user has permission to update (either the uploader or a group admin)
        if (resource.uploadedBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You don't have permission to update this resource" });
        }

        // If title is being updated, check for duplicates in the same group
        if (title && title !== resource.title) {
            const existingResource = await Resource.findOne({
                groupId: resource.groupId,
                title,
                _id: { $ne: resourceId }
            });
            if (existingResource) {
                return res.status(400).json({ error: "A resource with this title already exists in this group" });
            }
        }

        // Update the resource
        const updatedResource = await Resource.findByIdAndUpdate(
            resourceId,
            { 
                title: title || resource.title,
                url: url || resource.url,
                type: type || resource.type,
                description: description !== undefined ? description : resource.description,
                updatedAt: Date.now()
            },
            { new: true }
        )
        .populate('uploadedBy', 'name email')
        .exec();

        res.status(200).json(updatedResource);
    } catch (error) {
        console.error('Error updating resource:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a resource
const deleteResource = async (req, res) => {
    const userId = req.user._id;
    
    try {
        const resource = await Resource.findById(req.params.resourceId);
        if (!resource) return res.status(404).json({ error: "Resource not found" });

        // Check if user has permission to delete
        if (resource.uploadedBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You don't have permission to delete this resource" });
        }

        await Resource.findByIdAndDelete(req.params.resourceId);
        res.status(200).json({ message: "Resource deleted successfully!" });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createResource, getAllResources, getResourceById, updateResource, deleteResource };
