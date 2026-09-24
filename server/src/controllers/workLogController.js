const { WorkLog, Ticket } = require('../models');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const { ROLES, WORK_TYPES } = require('../constants');

const getWorkLogs = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  // Employees should not see internal technician work logs
  if (req.user.role === ROLES.EMPLOYEE) {
    throw ApiError.forbidden('Access denied: Work logs are restricted to IT staff');
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw ApiError.notFound('Ticket not found');
  }

  const workLogs = await WorkLog.find({ ticket: ticketId })
    .populate('technician', 'name email employeeId')
    .sort({ createdAt: -1 });

  return successResponse(res, 200, 'Work logs retrieved successfully', { workLogs });
});

const createWorkLog = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { description, timeSpentMinutes, workType } = req.body;

  // Employees cannot log technician work logs
  if (req.user.role === ROLES.EMPLOYEE) {
    throw ApiError.forbidden('Access denied: Only technicians and managers can add work logs');
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    throw ApiError.badRequest('Description is required');
  }

  if (timeSpentMinutes === undefined || timeSpentMinutes < 0) {
    throw ApiError.badRequest('timeSpentMinutes must be 0 or greater');
  }

  if (!workType || !Object.values(WORK_TYPES).includes(workType)) {
    throw ApiError.badRequest(
      `Invalid workType. Allowed values are: ${Object.values(WORK_TYPES).join(', ')}`
    );
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw ApiError.notFound('Ticket not found');
  }

  const workLog = await WorkLog.create({
    ticket: ticketId,
    technician: req.user._id,
    description: description.trim(),
    timeSpentMinutes: Number(timeSpentMinutes),
    workType,
  });

  const populatedLog = await WorkLog.findById(workLog._id).populate(
    'technician',
    'name email employeeId'
  );

  return successResponse(res, 201, 'Work log created successfully', { workLog: populatedLog });
});

module.exports = {
  getWorkLogs,
  createWorkLog,
};
