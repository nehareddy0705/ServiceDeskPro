const { TicketComment, Ticket } = require('../models');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const { createNotification } = require('../utils/notificationService');
const { ROLES, NOTIFICATION_TYPES } = require('../constants');

const getComments = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw ApiError.notFound('Ticket not found');
  }

  // Permission check
  if (req.user.role === ROLES.EMPLOYEE && ticket.requester.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Access denied: You can only view comments for your own tickets');
  }

  const filter = { ticket: ticketId };
  // Employees must never see internal comments
  if (req.user.role === ROLES.EMPLOYEE) {
    filter.isInternal = false;
  }

  const comments = await TicketComment.find(filter)
    .populate('user', 'name email role profileImage')
    .sort({ createdAt: 1 });

  return successResponse(res, 200, 'Comments retrieved successfully', { comments });
});

const createComment = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { message, isInternal, attachments } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw ApiError.badRequest('Comment message is required');
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw ApiError.notFound('Ticket not found');
  }

  // Permission check
  if (req.user.role === ROLES.EMPLOYEE && ticket.requester.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Access denied: You can only comment on your own tickets');
  }

  // Employees cannot post internal comments
  const internalFlag = req.user.role === ROLES.EMPLOYEE ? false : Boolean(isInternal);

  const comment = await TicketComment.create({
    ticket: ticketId,
    user: req.user._id,
    message: message.trim(),
    isInternal: internalFlag,
    attachments: Array.isArray(attachments) ? attachments : [],
  });

  const populatedComment = await TicketComment.findById(comment._id).populate(
    'user',
    'name email role profileImage'
  );

  // Send Notification
  // If requester commented -> notify assigned technician
  // If staff commented publicly -> notify requester
  if (req.user._id.toString() === ticket.requester.toString()) {
    if (ticket.assignedTo) {
      await createNotification({
        recipient: ticket.assignedTo,
        type: NOTIFICATION_TYPES.TICKET_UPDATED,
        title: `New Comment on Ticket: ${ticket.ticketNumber}`,
        message: `${req.user.name} added a comment: "${message.slice(0, 80)}..."`,
        ticket: ticket._id,
      });
    }
  } else if (!internalFlag) {
    await createNotification({
      recipient: ticket.requester,
      type: NOTIFICATION_TYPES.TICKET_UPDATED,
      title: `Update on Ticket: ${ticket.ticketNumber}`,
      message: `${req.user.name} commented on your ticket: "${message.slice(0, 80)}..."`,
      ticket: ticket._id,
    });
  }

  return successResponse(res, 201, 'Comment added successfully', { comment: populatedComment });
});

module.exports = {
  getComments,
  createComment,
};
