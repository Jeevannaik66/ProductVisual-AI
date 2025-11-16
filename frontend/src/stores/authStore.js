import { create } from 'zustand';
import { api } from '../api.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.me();
      set({ user: data.user || null, loading: false });
      return data.user || null;
    } catch (err) {
      set({ user: null, loading: false });
      return null;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await api.login(email, password);
      // server sets HttpOnly cookie; fetch user
      const user = await get().fetchUser();
      set({ loading: false });
      return user;
    } catch (err) {
      set({ error: err.message || 'Login failed', loading: false });
      throw err;
    }
  },

  signup: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.signup(email, password);
      set({ loading: false });
      return res;
    } catch (err) {
      set({ error: err.message || 'Signup failed', loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await api.logout();
    } catch (err) {
      // ignore errors on logout
    } finally {
      set({ user: null, loading: false });
    }
  }
}));

// prefer named export; do not default-export the hook
