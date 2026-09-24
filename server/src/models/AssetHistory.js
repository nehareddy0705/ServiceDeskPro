const mongoose = require('mongoose');
const { Schema } = mongoose;

const assetHistorySchema = new Schema(
  {
    asset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset reference is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'procured',
        'assigned',
        'unassigned',
        'repair_started',
        'repair_completed',
        'replaced',
        'lost',
        'retired',
        'disposed',
        'transferred',
      ],
      index: true,
    },
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    toUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'performedBy User is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

assetHistorySchema.index({ asset: 1, timestamp: -1 });

module.exports = mongoose.model('AssetHistory', assetHistorySchema);
