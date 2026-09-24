const express = require('express');
const router = express.Router({ mergeParams: true });
const ticketCommentController = require('../controllers/ticketCommentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(ticketCommentController.getComments)
  .post(ticketCommentController.createComment);

module.exports = router;
