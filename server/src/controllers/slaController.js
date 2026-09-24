const slaService = require('../services/slaService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getSLAPolicies = asyncHandler(async (req, res) => {
  const policies = await slaService.getSLAPolicies(req.query);
  return successResponse(res, 200, 'SLA Policies retrieved successfully', { policies });
});

const getSLAPolicyById = asyncHandler(async (req, res) => {
  const policy = await slaService.getSLAPolicyById(req.params.id);
  return successResponse(res, 200, 'SLA Policy retrieved successfully', { policy });
});

const createSLAPolicy = asyncHandler(async (req, res) => {
  const policy = await slaService.createSLAPolicy(req.body, req.user, req);
  return successResponse(res, 201, 'SLA Policy created successfully', { policy });
});

const updateSLAPolicy = asyncHandler(async (req, res) => {
  const policy = await slaService.updateSLAPolicy(req.params.id, req.body, req.user, req);
  return successResponse(res, 200, 'SLA Policy updated successfully', { policy });
});

const deleteSLAPolicy = asyncHandler(async (req, res) => {
  const result = await slaService.deleteSLAPolicy(req.params.id, req.user, req);
  return successResponse(res, 200, result.message);
});

module.exports = {
  getSLAPolicies,
  getSLAPolicyById,
  createSLAPolicy,
  updateSLAPolicy,
  deleteSLAPolicy,
};
