const bcrypt = require('bcryptjs');
const { User, Department } = require('../models');
const ApiError = require('../utils/apiError');
const logAudit = require('../utils/auditLogger');
const { AUDIT_ENTITY_TYPES, ROLES } = require('../constants');

const getUsers = async ({
  page = 1,
  limit = 10,
  role,
  department,
  isActive,
  search,
}) => {
  const query = {};

  if (role) {
    query.role = role;
  }

  if (department) {
    query.department = department;
  }

  if (isActive !== undefined && isActive !== '') {
    query.isActive = isActive === 'true' || isActive === true;
  }

  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { employeeId: searchRegex },
    ];
  }

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNumber - 1) * limitNumber;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      pages: Math.ceil(total / limitNumber),
    },
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id).select('-password').populate('department', 'name code');
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

const createUser = async (data, performedBy, req = null) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    throw ApiError.conflict('An account with this email address already exists');
  }

  if (data.employeeId && data.employeeId.trim()) {
    const existingEmpId = await User.findOne({ employeeId: data.employeeId.trim() });
    if (existingEmpId) {
      throw ApiError.conflict('An account with this employee ID already exists');
    }
  }

  if (data.department) {
    const dept = await Department.findById(data.department);
    if (!dept) {
      throw ApiError.badRequest('Specified department does not exist');
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  const newUser = await User.create({
    name: data.name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    employeeId: data.employeeId ? data.employeeId.trim() : undefined,
    role: data.role || ROLES.EMPLOYEE,
    department: data.department || null,
    phone: data.phone ? data.phone.trim() : undefined,
    profileImage: data.profileImage || '',
    isActive: data.isActive !== undefined ? data.isActive : true,
  });

  const createdUserObj = newUser.toObject();
  delete createdUserObj.password;

  await logAudit({
    user: performedBy._id,
    action: 'CREATE_USER',
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: newUser._id,
    newValue: createdUserObj,
    req,
  });

  return createdUserObj;
};

const updateUser = async (id, data, performedBy, req = null) => {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const oldValue = user.toObject();
  delete oldValue.password;

  if (data.email) {
    const normalizedEmail = data.email.toLowerCase().trim();
    if (normalizedEmail !== user.email) {
      const existingEmail = await User.findOne({ email: normalizedEmail, _id: { $ne: id } });
      if (existingEmail) {
        throw ApiError.conflict('Email is already taken by another account');
      }
      user.email = normalizedEmail;
    }
  }

  if (data.employeeId) {
    const trimmedEmpId = data.employeeId.trim();
    if (trimmedEmpId !== user.employeeId) {
      const existingEmpId = await User.findOne({ employeeId: trimmedEmpId, _id: { $ne: id } });
      if (existingEmpId) {
        throw ApiError.conflict('Employee ID is already in use by another account');
      }
      user.employeeId = trimmedEmpId;
    }
  }

  if (data.department !== undefined) {
    if (data.department) {
      const dept = await Department.findById(data.department);
      if (!dept) {
        throw ApiError.badRequest('Department does not exist');
      }
      user.department = dept._id;
    } else {
      user.department = null;
    }
  }

  if (data.name) user.name = data.name.trim();
  if (data.role) user.role = data.role;
  if (data.phone !== undefined) user.phone = data.phone ? data.phone.trim() : '';
  if (data.profileImage !== undefined) user.profileImage = data.profileImage;
  if (data.isActive !== undefined) user.isActive = data.isActive;

  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(data.password, salt);
  }

  await user.save();

  const updatedUserObj = await User.findById(id).select('-password').populate('department', 'name code');

  await logAudit({
    user: performedBy._id,
    action: 'UPDATE_USER',
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: id,
    oldValue,
    newValue: updatedUserObj,
    req,
  });

  return updatedUserObj;
};

const updateUserStatus = async (id, isActive, performedBy, req = null) => {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const oldValue = { isActive: user.isActive };
  user.isActive = Boolean(isActive);
  await user.save();

  const updatedUser = await User.findById(id).select('-password').populate('department', 'name code');

  await logAudit({
    user: performedBy._id,
    action: 'UPDATE_USER_STATUS',
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: id,
    oldValue,
    newValue: { isActive: user.isActive },
    req,
  });

  return updatedUser;
};

const deleteUser = async (id, performedBy, req = null) => {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent self-deletion
  if (performedBy._id.toString() === id.toString()) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  const oldValue = user.toObject();
  delete oldValue.password;

  // Soft delete for data integrity
  user.isActive = false;
  await user.save();

  await logAudit({
    user: performedBy._id,
    action: 'DEACTIVATE_USER',
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: id,
    oldValue,
    newValue: { isActive: false },
    req,
  });

  return { message: 'User deactivated successfully' };
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
};
