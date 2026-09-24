import api from './api';

export const categoryService = {
  getCategories: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data.data.categories;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data.category;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data.data.category;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.patch(`/categories/${id}`, categoryData);
    return response.data.data.category;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data.message;
  },
};
