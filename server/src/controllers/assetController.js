const assetService = require('../services/assetService');
const {
  validateCreateAsset,
  validateAssignAsset,
  validateUpdateStatus,
} = require('../validators/assetValidator');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getAssets = asyncHandler(async (req, res) => {
  const result = await assetService.getAssets(req.query, req.user);
  return successResponse(res, 200, 'Assets retrieved successfully', result.assets, result.pagination);
});

const getAssetById = asyncHandler(async (req, res) => {
  const asset = await assetService.getAssetById(req.params.id, req.user);
  return successResponse(res, 200, 'Asset retrieved successfully', { asset });
});

const createAsset = asyncHandler(async (req, res) => {
  validateCreateAsset(req.body);
  const asset = await assetService.createAsset(req.body, req.user, req);
  return successResponse(res, 201, 'Asset created successfully', { asset });
});

const updateAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.updateAsset(req.params.id, req.body, req.user, req);
  return successResponse(res, 200, 'Asset updated successfully', { asset });
});

const assignAsset = asyncHandler(async (req, res) => {
  validateAssignAsset(req.body);
  const asset = await assetService.assignAsset(req.params.id, req.body, req.user, req);
  return successResponse(res, 200, 'Asset assigned successfully', { asset });
});

const unassignAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.unassignAsset(req.params.id, req.body, req.user, req);
  return successResponse(res, 200, 'Asset unassigned successfully', { asset });
});

const updateAssetStatus = asyncHandler(async (req, res) => {
  validateUpdateStatus(req.body);
  const asset = await assetService.updateAssetStatus(req.params.id, req.body, req.user, req);
  return successResponse(res, 200, 'Asset status updated successfully', { asset });
});

const deleteAsset = asyncHandler(async (req, res) => {
  const result = await assetService.deleteAsset(req.params.id, req.user, req);
  return successResponse(res, 200, result.message);
});

const getAssetHistory = asyncHandler(async (req, res) => {
  const history = await assetService.getAssetHistory(req.params.assetId);
  return successResponse(res, 200, 'Asset history retrieved successfully', { history });
});

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  assignAsset,
  unassignAsset,
  updateAssetStatus,
  deleteAsset,
  getAssetHistory,
};
