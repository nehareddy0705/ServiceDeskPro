const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Department } = require('../models');
const ApiError = require('../utils/apiError');
const { ROLES } = require('../constants');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'servicedesk_pro_super_secret_jwt_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      department: user.department,
    },
    secret,
    { expiresIn }
  );
};

const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  return userObj;
};

const register = async ({ name, email, password, employeeId, department, role }, currentUser = null) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check duplicate email
  const existingUserByEmail = await User.findOne({ email: normalizedEmail });
  if (existingUserByEmail) {
    throw ApiError.conflict('An account with this email address already exists');
  }

  // Check duplicate employeeId if provided
  if (employeeId && employeeId.trim()) {
    const existingUserById = await User.findOne({ employeeId: employeeId.trim() });
    if (existingUserById) {
      throw ApiError.conflict('An account with this employee ID already exists');
    }
  }

  // Validate department if provided
  let departmentId = null;
  if (department) {
    const dept = await Department.findById(department);
    if (!dept) {
      throw ApiError.badRequest('The specified department does not exist');
    }
    departmentId = dept._id;
  }

  // Role security: public registration cannot create system_admin
  let assignedRole = ROLES.EMPLOYEE;
  const allowedRoles = Object.values(ROLES);

  if (role && allowedRoles.includes(role)) {
    if (role === ROLES.SYSTEM_ADMIN || role === ROLES.IT_MANAGER) {
      // Only an existing authenticated system_admin can assign admin/manager role
      if (currentUser && currentUser.role === ROLES.SYSTEM_ADMIN) {
        assignedRole = role;
      } else {
        assignedRole = ROLES.EMPLOYEE;
      }
    } else {
      assignedRole = role;
    }
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    employeeId: employeeId ? employeeId.trim() : undefined,
    department: departmentId,
    role: assignedRole,
    isActive: true,
  });

  const token = generateToken(newUser);
  return {
    user: sanitizeUser(newUser),
    token,
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).populate('department', 'name code');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.isActive === false) {
    throw ApiError.forbidden('Your account has been deactivated. Please contact your IT administrator.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Update lastLogin
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);
  return {
    user: sanitizeUser(user),
    token,
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).populate('department', 'name code');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.isActive === false) {
    throw ApiError.forbidden('Account is deactivated');
  }

  return sanitizeUser(user);
};

module.exports = {
  generateToken,
  sanitizeUser,
  register,
  login,
  getCurrentUser,
};
