const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: [
        'ticket_created',
        'ticket_assigned',
        'ticket_updated',
        'sla_warning',
        'sla_breach',
        'ticket_resolved',
        'ticket_reopened',
        'asset_assigned',
        'system',
      ],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null,
    },
    asset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
