const mongoose = require('mongoose');
const { Schema } = mongoose;

const workLogSchema = new Schema(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Ticket reference is required'],
      index: true,
    },
    technician: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Technician reference is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Work log description is required'],
      trim: true,
    },
    timeSpentMinutes: {
      type: Number,
      required: [true, 'Time spent in minutes is required'],
      min: [0, 'timeSpentMinutes cannot be negative'],
    },
    workType: {
      type: String,
      required: [true, 'Work type is required'],
      enum: [
        'diagnosis',
        'troubleshooting',
        'repair',
        'installation',
        'communication',
        'other',
      ],
    },
  },
  {
    timestamps: true,
  }
);

workLogSchema.index({ ticket: 1, createdAt: -1 });

module.exports = mongoose.model('WorkLog', workLogSchema);
