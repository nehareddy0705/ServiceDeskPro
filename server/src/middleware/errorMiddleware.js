const ApiError = require('../utils/apiError');
const { errorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new ApiError(400, message);
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = new ApiError(409, message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    const message = 'Validation Failed';
    error = new ApiError(400, message, errors);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token has expired. Please log in again.');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const errors = error.errors || null;

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('Unhandled Error:', err);
  }

  return errorResponse(res, statusCode, message, errors);
};

const notFoundHandler = (req, res, next) => {
  const err = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
  next(err);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
