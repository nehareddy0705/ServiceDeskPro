import api from './api';

export const departmentService = {
  getDepartments: async (params = {}) => {
    const response = await api.get('/departments', { params });
    return response.data.data.departments;
  },

  getDepartmentById: async (id) => {
    const response = await api.get(`/departments/${id}`);
    return response.data.data.department;
  },

  createDepartment: async (deptData) => {
    const response = await api.post('/departments', deptData);
    return response.data.data.department;
  },

  updateDepartment: async (id, deptData) => {
    const response = await api.patch(`/departments/${id}`, deptData);
    return response.data.data.department;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data.message;
  },
};
