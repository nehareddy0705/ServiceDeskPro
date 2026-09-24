const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

router.use(protect);
router.use(authorizeRoles(ROLES.SYSTEM_ADMIN));

router.get('/', auditLogController.getAuditLogs);

module.exports = router;
