const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const quizSchema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
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
    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },
        options: [
          {
            optionText: { type: String, required: true },
            isCorrect: { type: Boolean, default: false },
          },
        ],
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'UserAuth',
      required: true,
    },
    dueDate: {
      type: Date,
      required: false, // Making it optional
    },
    timeLimit: {
      type: Number, // in minutes
      default: null,
    },
    submissions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'UserAuth',
        },
        answers: [
          {
            questionId: Schema.Types.ObjectId,
            selectedOption: Schema.Types.ObjectId,
            isCorrect: Boolean,
          },
        ],
        score: Number,
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['in-progress', 'completed', 'graded'],
          default: 'in-progress',
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Add indexes for better performance
quizSchema.index({ groupId: 1, dueDate: 1 });
quizSchema.index({ dueDate: 1 });

// Middleware to sync with Deadline model
quizSchema.post('save', async function(doc) {
  if (doc.dueDate) {
    try {
      const Deadline = require('./Deadline');
      const Group = require('./Group');
      
      // Get group members who need deadlines
      const group = await Group.findById(doc.groupId).select('members');
      
      if (group && group.members.length > 0) {
        // Create or update deadlines for all group members
        await Promise.all(group.members.map(async (memberId) => {
          await Deadline.findOneAndUpdate(
            {
              relatedItem: doc._id,
              relatedItemModel: 'Quiz',
              user: memberId
            },
            {
              title: doc.title,
              description: doc.description || '',
              type: 'quiz',
              dueDate: doc.dueDate,
              group: doc.groupId,
              user: memberId,
              relatedItem: doc._id,
              relatedItemModel: 'Quiz'
            },
            { upsert: true, new: true }
          );
        }));
      }
    } catch (error) {
      console.error('Error syncing quiz deadlines:', error);
    }
  }
});

// Middleware to remove deadlines when quiz is deleted
quizSchema.post('remove', async function(doc) {
  try {
    const Deadline = require('./Deadline');
    await Deadline.deleteMany({
      relatedItem: doc._id,
      relatedItemModel: 'Quiz'
    });
  } catch (error) {
    console.error('Error cleaning up quiz deadlines:', error);
  }
});

module.exports = mongoose.model('Quiz', quizSchema);