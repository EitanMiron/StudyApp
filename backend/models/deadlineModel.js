const mongoose = require('mongoose');

const deadlineSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['quiz', 'assignment', 'project', 'exam', 'other'],
        required: true,
        default: 'other'
    },
    dueDate: {
        type: Date,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    relatedItem: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedItemModel'
    },
    relatedItemModel: {
        type: String,
        enum: ['Quiz', 'Assignment']
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
}, {
    timestamps: true
});

deadlineSchema.index({ user: 1, dueDate: 1 });
deadlineSchema.index({ dueDate: 1, isCompleted: 1 });

module.exports = mongoose.model('Deadline', deadlineSchema);