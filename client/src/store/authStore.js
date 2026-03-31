import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, authToken) => {
        // ✅ Save everything in Zustand
        set({
          user: userData,
          token: authToken,
          isAuthenticated: true,
        });

        // ✅ ALSO save manually (extra safety)
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', userData.role);
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });

        // ✅ Clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      },
    }),
    {
      name: 'hms-auth-storage',

      // ✅ IMPORTANT: restore auth correctly
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);

export default useAuthStore;