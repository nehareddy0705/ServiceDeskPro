const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

router.use(protect);

router
  .route('/')
  .get(assetController.getAssets)
  .post(
    authorizeRoles(ROLES.ASSET_MANAGER, ROLES.SYSTEM_ADMIN),
    assetController.createAsset
  );

router.get('/:assetId/history', assetController.getAssetHistory);

router
  .route('/:id')
  .get(assetController.getAssetById)
  .patch(
    authorizeRoles(ROLES.ASSET_MANAGER, ROLES.SYSTEM_ADMIN),
    assetController.updateAsset
  )
  .delete(
    authorizeRoles(ROLES.ASSET_MANAGER, ROLES.SYSTEM_ADMIN),
    assetController.deleteAsset
  );

router.patch(
  '/:id/assign',
  authorizeRoles(ROLES.ASSET_MANAGER, ROLES.SYSTEM_ADMIN),
  assetController.assignAsset
);

router.patch(
  '/:id/unassign',
  authorizeRoles(ROLES.ASSET_MANAGER, ROLES.SYSTEM_ADMIN),
  assetController.unassignAsset
);

router.patch(
  '/:id/status',
  authorizeRoles(ROLES.ASSET_MANAGER, ROLES.SYSTEM_ADMIN, ROLES.TECHNICIAN),
  assetController.updateAssetStatus
);

module.exports = router;
