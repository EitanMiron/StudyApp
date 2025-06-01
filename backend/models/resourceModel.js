const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const resourceSchema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group', // Links resource to a specific study group
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['document', 'video', 'link', 'other'],
      default: 'link',
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'UserAuth', // Changed back to UserAuth to match the model name
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
