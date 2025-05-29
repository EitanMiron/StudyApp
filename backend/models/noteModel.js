const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const noteSchema = new Schema(
  {
    term: {
      type: String,
      required: true,
      trim: true,
    },
    definition: {
      type: String,
      required: true,
      trim: true,
    },
    flashcards: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    collaborators: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        role: {
          type: String,
          enum: ['admin', 'editor'],
          default: 'editor',
        },
        modifiedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
