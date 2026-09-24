const mongoose = require('mongoose');
const { Schema } = mongoose;

const slaSubSchema = new Schema(
  {
    policy: {
      type: Schema.Types.ObjectId,
      ref: 'SLAPolicy',
      default: null,
    },
    responseDueAt: {
      type: Date,
    },
    resolutionDueAt: {
      type: Date,
    },
    responseAt: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
    responseBreached: {
      type: Boolean,
      default: false,
    },
    resolutionBreached: {
      type: Boolean,
      default: false,
    },
    escalated: {
      type: Boolean,
      default: false,
    },
    escalationLevel: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const aiClassificationSubSchema = new Schema(
  {
    predictedCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    predictedPriority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
    },
    probableIssue: {
      type: String,
      trim: true,
    },
    confidence: {
      type: Number,
      min: [0, 'Confidence cannot be less than 0'],
      max: [1, 'Confidence cannot exceed 1'],
    },
    suggestedArticles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'KnowledgeArticle',
      },
    ],
    suggestedTroubleshooting: [
      {
        type: String,
        trim: true,
      },
    ],
    analyzedAt: {
      type: Date,
    },
  },
  { _id: false }
);

const ticketSchema = new Schema(
  {
    ticketNumber: {
      type: String,
      required: [true, 'Ticket number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'open',
        'assigned',
        'in_progress',
        'pending',
        'resolved',
        'closed',
        'reopened',
      ],
      default: 'open',
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    asset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      default: null,
      index: true,
    },
    sla: {
      type: slaSubSchema,
      default: () => ({}),
    },
    aiClassification: {
      type: aiClassificationSubSchema,
      default: () => ({}),
    },
    resolution: {
      type: String,
      trim: true,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    reopenedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes on frequently searched/filtered fields
ticketSchema.index({ requester: 1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
