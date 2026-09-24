const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const ticketCommentRoutes = require('./ticketCommentRoutes');
const workLogRoutes = require('./workLogRoutes');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.use('/:ticketId/comments', ticketCommentRoutes);
router.use('/:ticketId/worklogs', workLogRoutes);

router
  .route('/')
  .post(ticketController.createTicket)
  .get(ticketController.getTickets);

router
  .route('/:id')
  .get(ticketController.getTicketById)
  .patch(ticketController.updateTicket);

router.post('/:id/ai-analyze', ticketController.aiAnalyze);
router.get('/:id/recommended-technicians', ticketController.getRecommendedTechnicians);

module.exports = router;
