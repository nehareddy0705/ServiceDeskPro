const vendorService = require('../services/vendorService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getVendors = asyncHandler(async (req, res) => {
  const vendors = await vendorService.getVendors(req.query);
  return successResponse(res, 200, 'Vendors retrieved successfully', { vendors });
});

const getVendorById = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getVendorById(req.params.id);
  return successResponse(res, 200, 'Vendor retrieved successfully', { vendor });
});

const createVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.createVendor(req.body, req.user, req);
  return successResponse(res, 201, 'Vendor created successfully', { vendor });
});

const updateVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.updateVendor(req.params.id, req.body, req.user, req);
  return successResponse(res, 200, 'Vendor updated successfully', { vendor });
});

const deleteVendor = asyncHandler(async (req, res) => {
  const result = await vendorService.deleteVendor(req.params.id, req.user, req);
  return successResponse(res, 200, result.message);
});

module.exports = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
};
