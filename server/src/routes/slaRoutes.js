const express = require('express');
const router = express.Router();
const slaController = require('../controllers/slaController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

router.use(protect);

router
  .route('/')
  .get(slaController.getSLAPolicies)
  .post(authorizeRoles(ROLES.SYSTEM_ADMIN), slaController.createSLAPolicy);

router
  .route('/:id')
  .get(slaController.getSLAPolicyById)
  .patch(authorizeRoles(ROLES.SYSTEM_ADMIN), slaController.updateSLAPolicy)
  .delete(authorizeRoles(ROLES.SYSTEM_ADMIN), slaController.deleteSLAPolicy);

module.exports = router;
