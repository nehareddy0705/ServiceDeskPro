import api from './api';

export const knowledgeService = {
  getArticles: async (params = {}) => {
    const response = await api.get('/knowledge', { params });
    return {
      articles: response.data.data,
      pagination: response.data.meta,
    };
  },

  getArticleById: async (id) => {
    const response = await api.get(`/knowledge/${id}`);
    return response.data.data.article;
  },

  createArticle: async (articleData) => {
    const response = await api.post('/knowledge', articleData);
    return response.data.data.article;
  },

  updateArticle: async (id, updateData) => {
    const response = await api.patch(`/knowledge/${id}`, updateData);
    return response.data.data.article;
  },

  deleteArticle: async (id) => {
    const response = await api.delete(`/knowledge/${id}`);
    return response.data.message;
  },

  submitFeedback: async (id, { helpful, comments }) => {
    const response = await api.post(`/knowledge/${id}/feedback`, { helpful, comments });
    return response.data.data.feedback;
  },
};
