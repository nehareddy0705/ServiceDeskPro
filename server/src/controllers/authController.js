const authService = require('../services/authService');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const setTokenCookie = (res, token) => {
  const days = parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 7;
  const cookieOptions = {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);
};

const register = asyncHandler(async (req, res) => {
  validateRegister(req.body);

  const currentUser = req.user || null;
  const { user, token } = await authService.register(req.body, currentUser);

  setTokenCookie(res, token);

  return successResponse(res, 201, 'User registered successfully', {
    user,
    token,
  });
});

const login = asyncHandler(async (req, res) => {
  validateLogin(req.body);

  const { user, token } = await authService.login(req.body);

  setTokenCookie(res, token);

  return successResponse(res, 200, 'Login successful', {
    user,
    token,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  return successResponse(res, 200, 'Current user profile fetched successfully', {
    user,
  });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return successResponse(
    res,
    200,
    'Logged out successfully. If you are storing bearer tokens locally, please remove the token on the client.'
  );
});

module.exports = {
  register,
  login,
  getMe,
  logout,
};
