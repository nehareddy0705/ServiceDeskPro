const departmentService = require('../services/departmentService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await departmentService.getDepartments(req.query);
  return successResponse(res, 200, 'Departments retrieved successfully', { departments });
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(req.params.id);
  return successResponse(res, 200, 'Department retrieved successfully', { department });
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment(req.body, req.user, req);
  return successResponse(res, 201, 'Department created successfully', { department });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(req.params.id, req.body, req.user, req);
  return successResponse(res, 200, 'Department updated successfully', { department });
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const result = await departmentService.deleteDepartment(req.params.id, req.user, req);
  return successResponse(res, 200, result.message);
});

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
