const ApiError = require('../utils/apiError');
const { ROLES } = require('../constants');

const validateCreateUser = (data) => {
  const { name, email, password, role } = data;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Name is required');
  }

  if (!email || typeof email !== 'string' || email.trim() === '') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please provide a valid email address');
    }
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters long');
  }

  if (role && !Object.values(ROLES).includes(role)) {
    errors.push(`Invalid role. Allowed roles are: ${Object.values(ROLES).join(', ')}`);
  }

  if (errors.length > 0) {
    throw ApiError.badRequest('Validation failed', errors);
  }
};

const validateUpdateUser = (data) => {
  const { email, password, role } = data;
  const errors = [];

  if (email !== undefined) {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please provide a valid email address');
    }
  }

  if (password !== undefined && (typeof password !== 'string' || password.length < 6)) {
    errors.push('Password must be at least 6 characters long');
  }

  if (role !== undefined && !Object.values(ROLES).includes(role)) {
    errors.push(`Invalid role. Allowed roles are: ${Object.values(ROLES).join(', ')}`);
  }

  if (errors.length > 0) {
    throw ApiError.badRequest('Validation failed', errors);
  }
};

module.exports = {
  validateCreateUser,
  validateUpdateUser,
};
