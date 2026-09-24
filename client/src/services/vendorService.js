import api from './api';

export const vendorService = {
  getVendors: async (params = {}) => {
    const response = await api.get('/vendors', { params });
    return response.data.data.vendors;
  },

  getVendorById: async (id) => {
    const response = await api.get(`/vendors/${id}`);
    return response.data.data.vendor;
  },

  createVendor: async (vendorData) => {
    const response = await api.post('/vendors', vendorData);
    return response.data.data.vendor;
  },

  updateVendor: async (id, vendorData) => {
    const response = await api.patch(`/vendors/${id}`, vendorData);
    return response.data.data.vendor;
  },

  deleteVendor: async (id) => {
    const response = await api.delete(`/vendors/${id}`);
    return response.data.message;
  },
};
