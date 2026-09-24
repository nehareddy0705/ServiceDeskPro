const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    defaultPriority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
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

categorySchema.index({ parentCategory: 1 });

module.exports = mongoose.model('Category', categorySchema);
