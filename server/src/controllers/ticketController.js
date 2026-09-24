const ticketService = require('../services/ticketService');
const { validateCreateTicket } = require('../validators/ticketValidator');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const createTicket = asyncHandler(async (req, res) => {
  validateCreateTicket(req.body);
  const ticket = await ticketService.createTicket(req.body, req.user, req);
  return successResponse(res, 201, 'Ticket created successfully', { ticket });
});

const getTickets = asyncHandler(async (req, res) => {
  const result = await ticketService.getTickets(req.query, req.user);
  return successResponse(res, 200, 'Tickets retrieved successfully', result.tickets, result.pagination);
});

const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await ticketService.getTicketById(req.params.id, req.user);
  return successResponse(res, 200, 'Ticket details retrieved successfully', { ticket });
});

const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.updateTicket(req.params.id, req.body, req.user, req);
  return successResponse(res, 200, 'Ticket updated successfully', { ticket });
});

const aiAnalyze = asyncHandler(async (req, res) => {
  const ticket = await ticketService.analyzeTicketWithAI(req.params.id);
  return successResponse(res, 200, 'AI analysis completed successfully', { ticket });
});

const getRecommendedTechnicians = asyncHandler(async (req, res) => {
  const recommendations = await ticketService.getRecommendedTechnicians(req.params.id);
  return successResponse(res, 200, 'Technician recommendations retrieved', { recommendations });
});

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  aiAnalyze,
  getRecommendedTechnicians,
};
