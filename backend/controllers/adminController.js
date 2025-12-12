const User = require('../models/authModel');
const Group = require('../models/groupModel');
const Quiz = require('../models/quizModel');
const Resource = require('../models/resourceModel');
const ActivityLog = require('../models/activityModel');
const Deadline = require('../models/deadlineModel');

const getAdminDashboard = async (req, res) => {
    try {
        const [totalUsers, activeGroups, totalQuizzes, recentActivityRaw, upcomingDeadlines] = await Promise.all([
            User.countDocuments(),
            Group.countDocuments({ 'members.0': { $exists: true } }),
            Quiz.countDocuments(),
            ActivityLog.find().sort('-createdAt').limit(5),
            Deadline.find({ dueDate: { $gte: new Date() } })
                .sort('dueDate')
                .limit(5)
                .populate('user', 'name email')
        ]);

        // Map recentActivity to include id and timestamp fields for frontend
        const recentActivity = recentActivityRaw.map(activity => ({
            id: activity._id,
            description: activity.description,
            type: activity.type,
            timestamp: activity.createdAt
        }));

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
        const { search, role, status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (role && role !== 'all') {
            query.role = role;
        }
        
        if (status && status !== 'all') {
            query.isActive = status === 'active';
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('name email role createdAt lastLogin isActive loginCount')
                .sort('-createdAt')
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        res.status(200).json({
            users,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, role, isActive } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (typeof isActive === 'boolean') user.isActive = isActive;

        await user.save();

        // Log the activity
        await ActivityLog.create({
            type: 'user',
            action: 'update',
            description: `Admin updated user: ${user.email}`,
            user: req.user.id,
            targetModel: 'User',
            targetId: userId
        });

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is admin
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot delete admin users' });
        }

        // Delete user's data (groups, notes, etc.)
        await Promise.all([
            Group.deleteMany({ owner: userId }),
            Quiz.deleteMany({ createdBy: userId }),
            Resource.deleteMany({ uploadedBy: userId }),
            Deadline.deleteMany({ user: userId })
        ]);

        await User.findByIdAndDelete(userId);

        // Log the activity
        await ActivityLog.create({
            type: 'user',
            action: 'delete',
            description: `Admin deleted user: ${user.email}`,
            user: req.user.id,
            targetModel: 'User',
            targetId: userId
        });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const bulkDeleteUsers = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'Invalid user IDs' });
        }

        // Check for admin users
        const adminUsers = await User.find({ _id: { $in: userIds }, role: 'admin' });
        if (adminUsers.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete admin users',
                adminEmails: adminUsers.map(u => u.email)
            });
        }

        // Delete users and their data
        await Promise.all([
            User.deleteMany({ _id: { $in: userIds } }),
            Group.deleteMany({ owner: { $in: userIds } }),
            Quiz.deleteMany({ createdBy: { $in: userIds } }),
            Resource.deleteMany({ uploadedBy: { $in: userIds } }),
            Deadline.deleteMany({ user: { $in: userIds } })
        ]);

        // Log the activity
        await ActivityLog.create({
            type: 'user',
            action: 'delete',
            description: `Admin deleted ${userIds.length} users`,
            user: req.user.id,
            targetModel: 'User',
            metadata: { count: userIds.length }
        });

        res.status(200).json({ message: `${userIds.length} users deleted successfully` });
    } catch (error) {
        console.error('Error bulk deleting users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;

        const [user, groups, quizzes, notes, deadlines] = await Promise.all([
            User.findById(userId).select('name email role createdAt lastLogin loginCount'),
            Group.find({ owner: userId }).countDocuments(),
            Quiz.find({ createdBy: userId }).countDocuments(),
            Group.aggregate([
                { $match: { owner: userId } },
                { $unwind: '$notes' },
                { $count: 'totalNotes' }
            ]),
            Deadline.find({ user: userId }).countDocuments()
        ]);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user,
            stats: {
                groupsCreated: groups,
                quizzesCreated: quizzes,
                notesCreated: notes[0]?.totalNotes || 0,
                deadlinesCreated: deadlines
            }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAdminGroups = async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('createdBy', 'name email')
            .populate('members.userId', 'name')
            .select('name description members createdBy createdAt');

        // Add computed fields: memberCount and status
        const groupsWithComputed = groups.map(group => ({
            id: group._id,
            name: group.name,
            description: group.description,
            status: group.members && group.members.length > 0 ? 'active' : 'inactive',
            memberCount: group.members ? group.members.length : 0,
            createdAt: group.createdAt,
            createdBy: group.createdBy,
        }));

        res.status(200).json(groupsWithComputed);
    } catch (error) {
        console.error('Error fetching admin groups:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAdminContent = async (req, res) => {
    try {
        const [quizzes, resources, deadlines] = await Promise.all([
            Quiz.find()
                .populate('createdBy', 'name email')
                .select('title description questionCount createdAt createdBy')
                .sort('-createdAt')
                .limit(50),
            Resource.find()
                .populate('uploadedBy', 'name email')
                .select('title description fileUrl uploadDate uploadedBy')
                .sort('-uploadDate')
                .limit(50),
            Deadline.find()
                .populate('user', 'name email')
                .select('title type dueDate user isCompleted')
                .sort('-dueDate')
                .limit(50)
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
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [userSignups, groupActivity, quizSubmissions, deadlineStats] = await Promise.all([
            User.aggregate([
                { 
                    $match: { 
                        createdAt: { $gte: startDate } 
                    }
                },
                { 
                    $group: { 
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Group.aggregate([
                { 
                    $match: { 
                        createdAt: { $gte: startDate } 
                    }
                },
                { 
                    $group: { 
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Quiz.aggregate([
                { $unwind: "$submissions" },
                { 
                    $match: { 
                        "submissions.submittedAt": { $gte: startDate } 
                    }
                },
                { 
                    $group: { 
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$submissions.submittedAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Deadline.aggregate([
                {
                    $match: { 
                        dueDate: { $gte: startDate } 
                    }
                },
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
                { $sort: { _id: 1 } }
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

const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Update group fields
        if (name) group.name = name;
        if (description) group.description = description;

        await group.save();

        // Log the activity
        await ActivityLog.create({
            type: 'group',
            action: 'update',
            description: `Admin updated group: ${group.name}`,
            user: req.user.id,
            targetModel: 'Group',
            targetId: groupId
        });

        res.status(200).json({ message: 'Group updated successfully', group });
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Delete the group
        await Group.findByIdAndDelete(groupId);

        // Log the activity
        await ActivityLog.create({
            type: 'group',
            action: 'delete',
            description: `Admin deleted group: ${group.name}`,
            user: req.user.id,
            targetModel: 'Group',
            targetId: groupId
        });

        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAdminDashboard,
    getAdminUsers,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    getUserStats,
    getAdminGroups,
    updateGroup,
    deleteGroup,
    getAdminContent,
    getAdminAnalytics
};