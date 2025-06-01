const express = require('express');
const resourceController = require('../controllers/resourceController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create a resource
router.post('/groups/:id/resources', resourceController.createResource);

// Get all resources in a study group
router.get('/groups/:id/resources', resourceController.getAllResources);

// Get a single resource by ID
router.get('/groups/:id/resources/:resourceId', resourceController.getResourceById);

//Update a resource
router.put('/groups/:id/resources/:resourceId', resourceController.updateResource);

// Delete a resource
router.delete('/groups/:id/resources/:resourceId', resourceController.deleteResource);

module.exports = router;
