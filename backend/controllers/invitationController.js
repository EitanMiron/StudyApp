const Invitation = require('../models/invitationModel');
const Group = require('../models/groupModel');

// Create a new invitation
const createInvitation = async (req, res) => {
    try {
        const { groupId, userId, inviterId } = req.body;
        
        // Check if invitation already exists
        const existingInvitation = await Invitation.findOne({
            groupId,
            userId,
            status: 'pending'
        });

        if (existingInvitation) {
            return res.status(400).json({ error: 'Invitation already exists' });
        }

        const invitation = new Invitation({
            groupId,
            userId,
            inviterId,
            status: 'pending'
        });

        await invitation.save();
        res.status(201).json(invitation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get invitations for a user
const getUserInvitations = async (req, res) => {
    try {
        const { userId } = req.params;
        const invitations = await Invitation.find({ userId, status: 'pending' })
            .populate('groupId')
            .populate('inviterId', 'name');
        res.status(200).json(invitations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Accept an invitation
const acceptInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;
        const invitation = await Invitation.findById(invitationId);

        if (!invitation) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        // Update invitation status
        invitation.status = 'accepted';
        await invitation.save();

        // Add user to group
        await Group.findByIdAndUpdate(
            invitation.groupId,
            { $addToSet: { members: invitation.userId } }
        );

        res.status(200).json({ message: 'Invitation accepted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Decline an invitation
const declineInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;
        const invitation = await Invitation.findById(invitationId);

        if (!invitation) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        invitation.status = 'declined';
        await invitation.save();

        res.status(200).json({ message: 'Invitation declined' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createInvitation,
    getUserInvitations,
    acceptInvitation,
    declineInvitation
}; 