import api from './api';

export const staffService = {
  getAll: async (params) => {
    const response = await api.get('/staff', { params });
    return response.data;
  },
  
  getOne: async (id) => {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  },
  
  createStaff: async (data) => {
    const response = await api.post('/staff', data);
    return response.data;
  },
  
  updateStaff: async (id, data) => {
    const response = await api.put(`/staff/${id}`, data);
    return response.data;
  },
  
  toggleStatus: async (id, status) => {
    const response = await api.patch(`/staff/${id}/status`, { status });
    return response.data;
  },
  
  updateWeeklySchedule: async (id, weeklySchedule) => {
    const response = await api.put(`/staff/${id}/schedule`, { weeklySchedule });
    return response.data;
  },
  
  getWeeklySchedule: async (id) => {
    const response = await api.get(`/staff/${id}/schedule`);
    return response.data;
  },
  
  getByDepartment: async (deptId) => {
    const response = await api.get(`/staff/department/${deptId}`);
    return response.data;
  }
};
