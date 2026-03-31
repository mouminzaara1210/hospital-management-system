import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// ✅ THIS IS THE MAIN FIX (TOKEN ATTACH)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export const settingsService = {
  getSettings: async () => {
    const res = await API.get('/settings');
    return res.data; // already correct
  },

  updateProfile: (data) => API.put('/settings/profile', data),
  updateFeeStructure: (data) => API.put('/settings/fees', data),
  updateNotificationSettings: (data) => API.put('/settings/notifications', data),
};