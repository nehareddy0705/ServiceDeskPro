import api from './api';

export const assetService = {
  getAssets: async (params = {}) => {
    const response = await api.get('/assets', { params });
    return {
      assets: response.data.data,
      pagination: response.data.meta,
    };
  },

  getAssetById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data.data.asset;
  },

  createAsset: async (assetData) => {
    const response = await api.post('/assets', assetData);
    return response.data.data.asset;
  },

  updateAsset: async (id, updateData) => {
    const response = await api.patch(`/assets/${id}`, updateData);
    return response.data.data.asset;
  },

  assignAsset: async (id, { toUserId, departmentId, notes }) => {
    const response = await api.patch(`/assets/${id}/assign`, { toUserId, departmentId, notes });
    return response.data.data.asset;
  },

  unassignAsset: async (id, { notes } = {}) => {
    const response = await api.patch(`/assets/${id}/unassign`, { notes });
    return response.data.data.asset;
  },

  updateStatus: async (id, { status, reason }) => {
    const response = await api.patch(`/assets/${id}/status`, { status, reason });
    return response.data.data.asset;
  },

  getAssetHistory: async (assetId) => {
    const response = await api.get(`/assets/${assetId}/history`);
    return response.data.data.history;
  },

  deleteAsset: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data.message;
  },
};
