const mongoose = require('mongoose');
const { Schema } = mongoose;

const assetSchema = new Schema(
  {
    assetTag: {
      type: String,
      required: [true, 'Asset tag is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Asset type is required'],
      enum: [
        'laptop',
        'desktop',
        'monitor',
        'printer',
        'server',
        'router',
        'mobile',
        'software',
        'other',
      ],
      index: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'available',
        'assigned',
        'under_repair',
        'lost',
        'retired',
        'disposed',
      ],
      default: 'available',
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
    purchaseDate: {
      type: Date,
    },
    purchaseCost: {
      type: Number,
      min: [0, 'Purchase cost cannot be negative'],
    },
    warrantyStart: {
      type: Date,
    },
    warrantyEnd: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
    },
    specifications: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Asset', assetSchema);
