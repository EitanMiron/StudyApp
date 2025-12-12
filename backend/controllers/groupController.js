const Group = require('../models/groupModel');

// Get all study groups
const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find();
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single study group
const getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new study group
const createGroup = async (req, res) => {
    const { name, subject, description } = req.body;
    const userId = req.body.userId; // Get userId from request body

    try {
        const newGroup = new Group({
            name,
            subject,
            description,
            members: [{
                userId,
                role: 'admin',
                joinedAt: new Date()
            }],
            createdBy: userId
        });
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: error.message });
    }
};

// Join a study group
const joinGroup = async (req, res) => {
    const { userId, role } = req.body;
    const groupId = req.params.id;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if user is already a member
        const isMember = group.members.some(member => 
            member.userId && member.userId.toString() === userId
        );
        
        if (isMember) {
            return res.status(400).json({ error: 'User already a member of the group' });
        }

        // Add new member
        group.members.push({
            userId: userId,
            role: role || 'member',
            joinedAt: new Date()
        });
        
        await group.save();
        
        // Return the updated group
        const updatedGroup = await Group.findById(groupId);
        res.status(200).json({ message: 'Joined group successfully', group: updatedGroup });
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ error: error.message });
    }
};

// Leave a study group
const leaveGroup = async (req, res) => {
    const userId = req.body.userId;
    const groupId = req.params.id;

    console.log(`[leaveGroup] Request to leave group ${groupId} by user ${userId}`);

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            console.log(`[leaveGroup] Group ${groupId} not found`);
            return res.status(404).json({ error: 'Group not found' });
        }

        // Find the member index
        const memberIndex = group.members.findIndex(member => 
            member.userId && member.userId.toString() === userId
        );

        if (memberIndex === -1) {
            console.log(`[leaveGroup] User ${userId} is not a member of group ${groupId}`);
            console.log(`[leaveGroup] Current members:`, group.members.map(m => m.userId));
            return res.status(400).json({ error: 'User is not a member of the group' });
        }

        // Remove the member
        group.members.splice(memberIndex, 1);
        await group.save();

        // Return the updated group
        const updatedGroup = await Group.findById(groupId);
        console.log(`[leaveGroup] User ${userId} left group ${groupId} successfully`);
        res.status(200).json({ message: 'Left group successfully', group: updatedGroup });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update a study group
const updateGroup = async (req, res) => {
    try {
        const updatedGroup = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedGroup) {
            return res.status(404).json({ error: 'Group not found (trying to update)' });
        }
        res.status(200).json(updatedGroup);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a study group
const deleteGroup = async (req, res) => {
    try {
        const deletedGroup = await Group.findByIdAndDelete(req.params.id);
        if (!deletedGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllGroups,
    getGroupById,
    createGroup,
    joinGroup,
    leaveGroup,
    updateGroup,
    deleteGroup
};
