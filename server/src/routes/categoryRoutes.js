const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

router.use(protect);

router
  .route('/')
  .get(categoryController.getCategories)
  .post(authorizeRoles(ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER), categoryController.createCategory);

router
  .route('/:id')
  .get(categoryController.getCategoryById)
  .patch(authorizeRoles(ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER), categoryController.updateCategory)
  .delete(authorizeRoles(ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER), categoryController.deleteCategory);

module.exports = router;
