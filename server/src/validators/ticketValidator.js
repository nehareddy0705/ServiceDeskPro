const ApiError = require('../utils/apiError');
const { TICKET_PRIORITIES, TICKET_STATUSES } = require('../constants');

const validateCreateTicket = (data) => {
  const { title, description, priority } = data;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('Ticket title is required');
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    errors.push('Ticket description is required');
  }

  if (priority && !Object.values(TICKET_PRIORITIES).includes(priority)) {
    errors.push(`Invalid priority. Allowed values: ${Object.values(TICKET_PRIORITIES).join(', ')}`);
  }

  if (errors.length > 0) {
    throw ApiError.badRequest('Validation failed', errors);
  }
};

const validateStatusTransition = (currentStatus, nextStatus, resolution = null) => {
  if (currentStatus === nextStatus) return;

  const validTransitions = {
    [TICKET_STATUSES.OPEN]: [TICKET_STATUSES.ASSIGNED, TICKET_STATUSES.IN_PROGRESS],
    [TICKET_STATUSES.ASSIGNED]: [
      TICKET_STATUSES.IN_PROGRESS,
      TICKET_STATUSES.PENDING,
      TICKET_STATUSES.OPEN,
    ],
    [TICKET_STATUSES.IN_PROGRESS]: [
      TICKET_STATUSES.PENDING,
      TICKET_STATUSES.RESOLVED,
      TICKET_STATUSES.ASSIGNED,
    ],
    [TICKET_STATUSES.PENDING]: [
      TICKET_STATUSES.IN_PROGRESS,
      TICKET_STATUSES.RESOLVED,
    ],
    [TICKET_STATUSES.RESOLVED]: [
      TICKET_STATUSES.CLOSED,
      TICKET_STATUSES.REOPENED,
    ],
    [TICKET_STATUSES.CLOSED]: [
      TICKET_STATUSES.REOPENED,
    ],
    [TICKET_STATUSES.REOPENED]: [
      TICKET_STATUSES.IN_PROGRESS,
      TICKET_STATUSES.ASSIGNED,
    ],
  };

  const allowedNext = validTransitions[currentStatus] || [];
  if (!allowedNext.includes(nextStatus)) {
    throw ApiError.badRequest(
      `Invalid status transition from '${currentStatus}' to '${nextStatus}'. Allowed transitions: ${
        allowedNext.join(', ') || 'none'
      }`
    );
  }

  if (nextStatus === TICKET_STATUSES.RESOLVED && (!resolution || !resolution.trim())) {
    throw ApiError.badRequest('A resolution summary is required when resolving a ticket');
  }
};

module.exports = {
  validateCreateTicket,
  validateStatusTransition,
};
