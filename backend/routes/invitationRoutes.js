const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');

// Create a new invitation
router.post('/', invitationController.createInvitation);

// Get invitations for a user
router.get('/user/:userId', invitationController.getUserInvitations);

// Accept an invitation
router.post('/:invitationId/accept', invitationController.acceptInvitation);

// Decline an invitation
router.post('/:invitationId/decline', invitationController.declineInvitation);

module.exports = router; 