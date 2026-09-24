const { Notification } = require('../models');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(40)
    .populate('ticket', 'ticketNumber title priority status')
    .populate('asset', 'assetTag name');

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  return successResponse(res, 200, 'Notifications retrieved successfully', {
    notifications,
    unreadCount,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  return successResponse(res, 200, 'Notification marked as read', { notification });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  return successResponse(res, 200, 'All notifications marked as read');
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
