const categoryService = require('../services/categoryService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories(req.query);
  return successResponse(res, 200, 'Categories retrieved successfully', { categories });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  return successResponse(res, 200, 'Category retrieved successfully', { category });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.user, req);
  return successResponse(res, 201, 'Category created successfully', { category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body, req.user, req);
  return successResponse(res, 200, 'Category updated successfully', { category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id, req.user, req);
  return successResponse(res, 200, result.message);
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
