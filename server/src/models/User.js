const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['system_admin', 'it_manager', 'technician', 'employee', 'asset_manager'],
      default: 'employee',
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
