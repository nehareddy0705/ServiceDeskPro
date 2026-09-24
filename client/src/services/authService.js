import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data.data;
    if (token) {
      localStorage.setItem('servicedesk_token', token);
      localStorage.setItem('servicedesk_user', JSON.stringify(user));
    }
    return { user, token };
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('servicedesk_token');
      localStorage.removeItem('servicedesk_user');
    }
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    const user = response.data.data.user;
    localStorage.setItem('servicedesk_user', JSON.stringify(user));
    return user;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data.data;
  },
};
