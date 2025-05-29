const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['user', 'group', 'quiz', 'resource', 'note', 'deadline', 'system']
    },
    action: {
        type: String,
        required: true,
        enum: [
            'create', 'update', 'delete', 
            'login', 'logout', 'register',
            'join', 'leave', 'submit',
            'upload', 'download', 'complete'
        ]
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetModel: {
        type: String,
        enum: ['User', 'Group', 'Quiz', 'Resource', 'Note', 'Deadline']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for faster querying
activityLogSchema.index({ type: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

// Virtual for formatted timestamp
activityLogSchema.virtual('formattedTimestamp').get(function() {
    return this.createdAt.toLocaleString();
});

// Static method for logging activities
activityLogSchema.statics.logActivity = async function(activityData) {
    try {
        const activity = new this(activityData);
        await activity.save();
        return activity;
    } catch (error) {
        console.error('Error logging activity:', error);
        throw error;
    }
};

// Middleware to automatically trim description
activityLogSchema.pre('save', function(next) {
    if (this.description) {
        this.description = this.description.trim();
    }
    next();
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);