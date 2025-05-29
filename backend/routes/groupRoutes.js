const express = require('express');
const groupController = require('../controllers/groupController');

const router = express.Router();

// GET all study groups
router.get('/groups', groupController.getAllGroups);

// GET a single study group
router.get('/groups/:id', groupController.getGroupById);

// POST (create) a new study group
router.post('/groups', groupController.createGroup);

// POST (join) a study group
router.post('/groups/:id/join', groupController.joinGroup);

// POST (leave) a study group
router.post('/groups/:id/leave', groupController.leaveGroup);

// PUT (update) a study group
router.put('/groups/:id', groupController.updateGroup);

// DELETE a study group
router.delete('/groups/:id', groupController.deleteGroup);

module.exports = router;
