const { Notification } = require('../models');

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  ticket = null,
  asset = null,
}) => {
  try {
    if (!recipient) return null;
    return await Notification.create({
      recipient,
      type,
      title,
      message,
      ticket,
      asset,
      isRead: false,
    });
  } catch (error) {
    console.error('Notification creation failed:', error.message);
    return null;
  }
};

module.exports = {
  createNotification,
};
