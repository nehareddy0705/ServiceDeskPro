const mongoose = require('mongoose');
const { Schema } = mongoose;

const ticketCommentSchema = new Schema(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Ticket reference is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    isInternal: {
      type: Boolean,
      default: false,
      index: true,
    },
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

ticketCommentSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model('TicketComment', ticketCommentSchema);
