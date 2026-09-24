const ApiError = require('../utils/apiError');

const validateRegister = (data) => {
  const { name, email, password } = data;
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

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    throw ApiError.badRequest('Validation failed', errors);
  }
};

const validateLogin = (data) => {
  const { email, password } = data;
  const errors = [];

  if (!email || typeof email !== 'string' || email.trim() === '') {
    errors.push('Email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    throw ApiError.badRequest('Validation failed', errors);
  }
};

module.exports = {
  validateRegister,
  validateLogin,
};
