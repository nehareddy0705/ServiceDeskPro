import api from './api';

export const auditService = {
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/audit-logs', { params });
    return {
      auditLogs: response.data.data,
      pagination: response.data.meta,
    };
  },
};
