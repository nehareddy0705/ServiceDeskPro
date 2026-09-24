const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  // Check Bearer Token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Check HTTP-only cookie
    token = req.cookies.token;
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication required. Please provide a valid token.');
  }

  const secret = process.env.JWT_SECRET || 'servicedesk_pro_super_secret_jwt_key_2026';
  const decoded = jwt.verify(token, secret);

  const user = await User.findById(decoded.id).select('-password').populate('department', 'name code');
  if (!user) {
    throw ApiError.unauthorized('The user belonging to this token no longer exists.');
  }

  if (user.isActive === false) {
    throw ApiError.forbidden('User account is deactivated. Please contact your administrator.');
  }

  req.user = user;
  next();
});

module.exports = {
  protect,
};
