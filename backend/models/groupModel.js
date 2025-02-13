const mongoose = require('mongoose')

const Schema = mongoose.Schema

const groupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    members: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'UserAuth',
                required: true,
            },
            role: {
                type: String,
                enum: ['admin', 'member'], //controls permissions
                default: 'member',
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'UserAuth', //stroing ID of the user who created the group
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

    





    
}, { timestamps: true })

module.exports = mongoose.model('group', groupSchema)