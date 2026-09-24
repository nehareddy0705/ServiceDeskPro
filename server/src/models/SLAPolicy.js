const mongoose = require('mongoose');
const { Schema } = mongoose;

const escalationRuleSchema = new Schema(
  {
    triggerAfterMinutes: {
      type: Number,
      required: [true, 'triggerAfterMinutes is required'],
      min: [1, 'triggerAfterMinutes must be at least 1 minute'],
    },
    escalationLevel: {
      type: Number,
      required: [true, 'escalationLevel is required'],
      min: [1, 'escalationLevel must be at least 1'],
    },
    notifyRoles: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { _id: false }
);

const slaPolicySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'SLA policy name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: [true, 'Priority is required'],
    },
    responseTimeMinutes: {
      type: Number,
      required: [true, 'Response time in minutes is required'],
      min: [1, 'responseTimeMinutes must be at least 1'],
    },
    resolutionTimeMinutes: {
      type: Number,
      required: [true, 'Resolution time in minutes is required'],
      min: [1, 'resolutionTimeMinutes must be at least 1'],
    },
    businessHoursOnly: {
      type: Boolean,
      default: true,
    },
    escalationRules: {
      type: [escalationRuleSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SLAPolicy', slaPolicySchema);
