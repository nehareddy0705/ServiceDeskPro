const { AuditLog } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getAuditLogs = asyncHandler(async (req, res) => {
  const { entityType, action, search, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (entityType) {
    filter.entityType = entityType;
  }
  if (action) {
    filter.action = action;
  }
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { action: searchRegex },
      { ipAddress: searchRegex },
      { userAgent: searchRegex },
    ];
  }

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNumber - 1) * limitNumber;

  const [auditLogs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('user', 'name email role employeeId')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNumber),
    AuditLog.countDocuments(filter),
  ]);

  return successResponse(res, 200, 'Audit logs retrieved successfully', auditLogs, {
    total,
    page: pageNumber,
    limit: limitNumber,
    pages: Math.ceil(total / limitNumber),
  });
});

module.exports = {
  getAuditLogs,
};
