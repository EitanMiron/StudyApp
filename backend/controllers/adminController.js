const User = require('../models/authModel');
const Group = require('../models/groupModel');
const Quiz = require('../models/quizModel');
const Resource = require('../models/resourceModel');
const ActivityLog = require('../models/activityModel');
const Deadline = require('../models/deadlineModel');

const getAdminDashboard = async (req, res) => {
    try {
        const [totalUsers, activeGroups, totalQuizzes, recentActivity, upcomingDeadlines] = await Promise.all([
            User.countDocuments(),
            Group.countDocuments({ status: 'active' }),
            Quiz.countDocuments(),
            ActivityLog.find().sort('-timestamp').limit(5),
            Deadline.find({ dueDate: { $gte: new Date() } })
                .sort('dueDate')
                .limit(5)
                .populate('user', 'name email')
        ]);

        res.status(200).json({
            totalUsers,
            activeGroups,
            totalQuizzes,
            recentActivity,
            upcomingDeadlines
        });
    } catch (error) {
        console.error('Error fetching admin dashboard:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAdminUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('name email role createdAt lastLogin')
            .sort('-createdAt');

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAdminGroups = async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('owner', 'name email')
            .populate('members', 'name')
            .select('name description status memberCount createdAt');

        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching admin groups:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAdminContent = async (req, res) => {
    try {
        const [quizzes, resources, deadlines] = await Promise.all([
            Quiz.find().select('title description questionCount createdAt'),
            Resource.find().select('title description fileUrl uploadDate'),
            Deadline.find().sort('-dueDate').limit(10).populate('user', 'name')
        ]);

        res.status(200).json({
            quizzes,
            resources,
            deadlines
        });
    } catch (error) {
        console.error('Error fetching admin content:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAdminAnalytics = async (req, res) => {
    try {
        const [userSignups, groupActivity, quizSubmissions, deadlineStats] = await Promise.all([
            User.aggregate([
                { 
                    $group: { 
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } },
                { $limit: 30 }
            ]),
            Group.aggregate([
                { 
                    $group: { 
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } },
                { $limit: 30 }
            ]),
            Quiz.aggregate([
                { $unwind: "$submissions" },
                { 
                    $group: { 
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$submissions.submittedAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } },
                { $limit: 30 }
            ]),
            Deadline.aggregate([
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$dueDate" }
                        },
                        count: { $sum: 1 },
                        completed: {
                            $sum: { 
                                $cond: [
                                    { $eq: ["$isCompleted", true] }, 
                                    1, 
                                    0 
                                ] 
                            }
                        }
                    }
                },
                { $sort: { _id: 1 } },
                { $limit: 30 }
            ])
        ]);

        res.status(200).json({
            userSignups,
            groupActivity,
            quizSubmissions,
            deadlineStats
        });
    } catch (error) {
        console.error('Error fetching admin analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAdminDashboard,
    getAdminUsers,
    getAdminGroups,
    getAdminContent,
    getAdminAnalytics
};