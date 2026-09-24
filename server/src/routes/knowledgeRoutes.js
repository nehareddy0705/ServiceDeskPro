const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

router.use(protect);

router
  .route('/')
  .get(knowledgeController.getArticles)
  .post(
    authorizeRoles(ROLES.TECHNICIAN, ROLES.IT_MANAGER, ROLES.SYSTEM_ADMIN),
    knowledgeController.createArticle
  );

router.post('/:id/feedback', knowledgeController.submitFeedback);

router
  .route('/:id')
  .get(knowledgeController.getArticleById)
  .patch(
    authorizeRoles(ROLES.TECHNICIAN, ROLES.IT_MANAGER, ROLES.SYSTEM_ADMIN),
    knowledgeController.updateArticle
  )
  .delete(
    authorizeRoles(ROLES.IT_MANAGER, ROLES.SYSTEM_ADMIN),
    knowledgeController.deleteArticle
  );

module.exports = router;
