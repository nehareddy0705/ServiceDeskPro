const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

router.use(protect);

router
  .route('/')
  .get(departmentController.getDepartments)
  .post(authorizeRoles(ROLES.SYSTEM_ADMIN), departmentController.createDepartment);

router
  .route('/:id')
  .get(departmentController.getDepartmentById)
  .patch(authorizeRoles(ROLES.SYSTEM_ADMIN), departmentController.updateDepartment)
  .delete(authorizeRoles(ROLES.SYSTEM_ADMIN), departmentController.deleteDepartment);

module.exports = router;
