const ApiError = require('../utils/apiError');
const { ASSET_TYPES, ASSET_STATUSES } = require('../constants');

const validateCreateAsset = (data) => {
  const { assetTag, name, type } = data;
  const errors = [];

  if (!assetTag || typeof assetTag !== 'string' || assetTag.trim() === '') {
    errors.push('Asset tag is required');
  }

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Asset name is required');
  }

  if (!type || !Object.values(ASSET_TYPES).includes(type)) {
    errors.push(`Invalid asset type. Allowed values: ${Object.values(ASSET_TYPES).join(', ')}`);
  }

  if (errors.length > 0) {
    throw ApiError.badRequest('Validation failed', errors);
  }
};

const validateAssignAsset = (data) => {
  const { toUserId } = data;
  if (!toUserId) {
    throw ApiError.badRequest('toUserId is required to assign an asset');
  }
};

const validateUpdateStatus = (data) => {
  const { status } = data;
  if (!status || !Object.values(ASSET_STATUSES).includes(status)) {
    throw ApiError.badRequest(
      `Invalid asset status. Allowed values: ${Object.values(ASSET_STATUSES).join(', ')}`
    );
  }
};

module.exports = {
  validateCreateAsset,
  validateAssignAsset,
  validateUpdateStatus,
};
