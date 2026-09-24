const ApiError = require('../utils/apiError');
const { ROLES } = require('../constants');

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`Role '${req.user.role}' is not authorized to access this resource`)
      );
    }

    next();
  };
};

const authorizeDepartmentAccess = (getDepartmentIdFromReq) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    // System Admins and IT Managers have organization-wide access
    if (req.user.role === ROLES.SYSTEM_ADMIN || req.user.role === ROLES.IT_MANAGER) {
      return next();
    }

    const targetDeptId = typeof getDepartmentIdFromReq === 'function'
      ? getDepartmentIdFromReq(req)
      : (req.params.departmentId || req.body.department || req.query.department);

    if (!targetDeptId) {
      return next();
    }

    const userDeptId = req.user.department ? req.user.department._id || req.user.department : null;

    if (!userDeptId || userDeptId.toString() !== targetDeptId.toString()) {
      return next(ApiError.forbidden('Access denied: You do not have permission for this department'));
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
  authorizeDepartmentAccess,
};
