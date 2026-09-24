import api from './api';

export const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return {
      users: response.data.data,
      pagination: response.data.meta,
    };
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data.data.user;
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data.data.user;
  },

  updateUser: async (id, userData) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data.data.user;
  },

  updateUserStatus: async (id, isActive) => {
    const response = await api.patch(`/users/${id}/status`, { isActive });
    return response.data.data.user;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data.message;
  },
};
