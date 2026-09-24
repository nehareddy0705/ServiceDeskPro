const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

router.use(protect);

router
  .route('/')
  .get(vendorController.getVendors)
  .post(
    authorizeRoles(ROLES.ASSET_MANAGER, ROLES.SYSTEM_ADMIN),
    vendorController.createVendor
  );

router
  .route('/:id')
  .get(vendorController.getVendorById)
  .patch(
    authorizeRoles(ROLES.ASSET_MANAGER, ROLES.SYSTEM_ADMIN),
    vendorController.updateVendor
  )
  .delete(
    authorizeRoles(ROLES.ASSET_MANAGER, ROLES.SYSTEM_ADMIN),
    vendorController.deleteVendor
  );

module.exports = router;
