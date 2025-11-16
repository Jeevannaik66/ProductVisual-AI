import { create } from 'zustand';

export const useUIStore = create((set) => ({
  globalLoading: false,
  notifications: [],

  setGlobalLoading: (v) => set({ globalLoading: v }),

  pushNotification: (n) => set((s) => ({ notifications: [...s.notifications, n] })),
  clearNotifications: () => set({ notifications: [] }),
  shiftNotification: () => set((s) => ({ notifications: s.notifications.slice(1) })),
}));

// prefer named export only
