const { AuditLog } = require('../models');

const logAudit = async ({
  user = null,
  action,
  entityType,
  entityId = null,
  oldValue = null,
  newValue = null,
  req = null,
}) => {
  try {
    let ipAddress = '';
    let userAgent = '';

    if (req) {
      ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
      userAgent = req.headers['user-agent'] || '';
    }

    await AuditLog.create({
      user: user || (req && req.user ? req.user._id : null),
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('AuditLog writing failed:', error.message);
  }
};

module.exports = logAudit;
