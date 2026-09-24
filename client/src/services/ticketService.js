import api from './api';

export const ticketService = {
  getTickets: async (params = {}) => {
    const response = await api.get('/tickets', { params });
    return {
      tickets: response.data.data,
      pagination: response.data.meta,
    };
  },

  getTicketById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data.data.ticket;
  },

  createTicket: async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data.data.ticket;
  },

  updateTicket: async (id, updateData) => {
    const response = await api.patch(`/tickets/${id}`, updateData);
    return response.data.data.ticket;
  },

  getComments: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/comments`);
    return response.data.data.comments;
  },

  addComment: async (ticketId, commentData) => {
    const response = await api.post(`/tickets/${ticketId}/comments`, commentData);
    return response.data.data.comment;
  },

  getWorkLogs: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/worklogs`);
    return response.data.data.workLogs;
  },

  addWorkLog: async (ticketId, workLogData) => {
    const response = await api.post(`/tickets/${ticketId}/worklogs`, workLogData);
    return response.data.data.workLog;
  },

  aiAnalyze: async (ticketId) => {
    const response = await api.post(`/tickets/${ticketId}/ai-analyze`);
    return response.data.data.ticket;
  },

  getRecommendedTechnicians: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/recommended-technicians`);
    return response.data.data.recommendations;
  },
};
