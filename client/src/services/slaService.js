import api from './api';

export const slaService = {
  getPolicies: async (params = {}) => {
    const response = await api.get('/sla', { params });
    return response.data.data.policies;
  },

  getPolicyById: async (id) => {
    const response = await api.get(`/sla/${id}`);
    return response.data.data.policy;
  },

  createPolicy: async (policyData) => {
    const response = await api.post('/sla', policyData);
    return response.data.data.policy;
  },

  updatePolicy: async (id, policyData) => {
    const response = await api.patch(`/sla/${id}`, policyData);
    return response.data.data.policy;
  },

  deletePolicy: async (id) => {
    const response = await api.delete(`/sla/${id}`);
    return response.data.message;
  },
};
