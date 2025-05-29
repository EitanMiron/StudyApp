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
        
        const enrolledGroups = await Group.countDocuments({ members: userId });
        const completedQuizzes = await Quiz.countDocuments({ 
            'submissions.user': userId, 
            'submissions.status': 'completed' 
        });
        const totalNotes = await Note.countDocuments({ 
            'collaborators.userId': userId 
        });
        const totalResources = await Resource.countDocuments({ 
            $or: [
                { isPublic: true },
                { sharedWith: userId }
            ]
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
        const groups = await Group.find({ members: userId })
            .populate('owner', 'name email')
            .select('name description memberCount createdAt');

        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching user groups:', error);
        res.status(500).json({ message: 'Server error' });
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
        const quizzes = await Quiz.find({
            $or: [
                { 'group.members': userId },
                { isPublic: true }
            ]
        })
        .populate('createdBy', 'name')
        .select('title description questionCount dueDate');

        res.status(200).json(quizzes);
    } catch (error) {
        console.error('Error fetching user quizzes:', error);
        res.status(500).json({ message: 'Server error' });
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