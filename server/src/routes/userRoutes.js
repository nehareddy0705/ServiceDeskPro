const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

router.use(protect);

router
  .route('/')
  .get(authorizeRoles(ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER), userController.getUsers)
  .post(authorizeRoles(ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER), userController.createUser);

router
  .route('/:id')
  .get(authorizeRoles(ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER, ROLES.TECHNICIAN), userController.getUserById)
  .patch(authorizeRoles(ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER), userController.updateUser)
  .delete(authorizeRoles(ROLES.SYSTEM_ADMIN), userController.deleteUser);

router.patch(
  '/:id/status',
  authorizeRoles(ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER),
  userController.updateUserStatus
);

module.exports = router;
