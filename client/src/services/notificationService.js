import api from './api';

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data.notification;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};
