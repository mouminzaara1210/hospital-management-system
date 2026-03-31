import api from './api';

export const userService = {
  getMe: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },

  updateMe: async (payload) => {
    const res = await api.patch('/users/me', payload);
    return res.data;
  },

  changePassword: async (payload) => {
    const res = await api.patch('/users/me/password', payload);
    return res.data;
  },

  updatePreferences: async (payload) => {
    const res = await api.patch('/users/me/preferences', payload);
    return res.data;
  },

  getStats: async () => {
    const res = await api.get('/users/me/stats');
    return res.data;
  }
};
