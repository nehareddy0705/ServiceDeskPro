const express = require('express');
const router = express.Router({ mergeParams: true });
const workLogController = require('../controllers/workLogController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(workLogController.getWorkLogs)
  .post(workLogController.createWorkLog);

module.exports = router;
