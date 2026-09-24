const userService = require('../services/userService');
const { validateCreateUser, validateUpdateUser } = require('../validators/userValidator');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(req.query);
  return successResponse(res, 200, 'Users retrieved successfully', result.users, result.pagination);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return successResponse(res, 200, 'User retrieved successfully', { user });
});

const createUser = asyncHandler(async (req, res) => {
  validateCreateUser(req.body);
  const user = await userService.createUser(req.body, req.user, req);
  return successResponse(res, 201, 'User created successfully', { user });
});

const updateUser = asyncHandler(async (req, res) => {
  validateUpdateUser(req.body);
  const user = await userService.updateUser(req.params.id, req.body, req.user, req);
  return successResponse(res, 200, 'User updated successfully', { user });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await userService.updateUserStatus(req.params.id, isActive, req.user, req);
  return successResponse(res, 200, 'User status updated successfully', { user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id, req.user, req);
  return successResponse(res, 200, result.message);
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
};
