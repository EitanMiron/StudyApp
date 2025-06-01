const User = require('../models/authModel');
const Group = require('../models/groupModel');
const Quiz = require('../models/quizModel');
const Note = require('../models/noteModel');
const Resource = require('../models/resourceModel');
const Deadline = require('../models/deadlineModel');
const mongoose = require('mongoose');

const getUserDashboard = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        
        // Get all groups the user is a member of
        const userGroups = await Group.find({ 'members.userId': userId }).select('_id');
        const groupIds = userGroups.map(group => group._id);

        const enrolledGroups = userGroups.length;
        const completedQuizzes = await Quiz.countDocuments({ 
            'submissions.user': userId, 
            'submissions.status': 'completed' 
        });
        const totalNotes = await Note.countDocuments({ 
            'collaborators.userId': userId 
        });
        const totalResources = await Resource.countDocuments({ 
            groupId: { $in: groupIds }
        });
        const upcomingDeadlines = await Deadline.find({
            user: userId,
            dueDate: { $gte: new Date() },
            isCompleted: false
        })
        .sort('dueDate')
        .limit(5)
        .select('title type dueDate');

        res.status(200).json({
            enrolledGroups,
            completedQuizzes,
            totalNotes,
            totalResources,
            upcomingDeadlines
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching groups for user:', userId); // Debug log

        const groups = await Group.find({ 'members.userId': userId })
            .populate('createdBy', 'name email')
            .select('name description members createdAt');

        console.log('Found groups:', groups); // Debug log
        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching user groups:', error);
        // Send more detailed error information
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const getUserNotes = async (req, res) => {
    try {
        const userId = req.user.id;
        const notes = await Note.find({ user: userId })
            .sort('-createdAt')
            .select('title content tags createdAt');

        res.status(200).json(notes);
    } catch (error) {
        console.error('Error fetching user notes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserQuizzes = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching quizzes for user:', userId); // Debug log

        // First get all groups the user is a member of
        const userGroups = await Group.find({ 'members.userId': userId }).select('_id');
        const groupIds = userGroups.map(group => group._id);

        // Then find all quizzes in those groups
        const quizzes = await Quiz.find({
            $or: [
                { groupId: { $in: groupIds } },
                { isPublic: true }
            ]
        })
        .populate('createdBy', 'name')
        .populate('groupId', 'name')
        .select('title description questions dueDate timeLimit submissions')
        .sort('-createdAt');

        console.log('Found quizzes:', quizzes); // Debug log
        res.status(200).json(quizzes);
    } catch (error) {
        console.error('Error fetching user quizzes:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const getUserResources = async (req, res) => {
    try {
        const userId = req.user.id;
        const resources = await Resource.find({
            $or: [
                { isPublic: true },
                { sharedWith: userId }
            ]
        })
        .sort('-uploadDate')
        .select('title description fileUrl uploadDate');

        res.status(200).json(resources);
    } catch (error) {
        console.error('Error fetching user resources:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUserDashboard,
    getUserGroups,
    getUserNotes,
    getUserQuizzes,
    getUserResources
};