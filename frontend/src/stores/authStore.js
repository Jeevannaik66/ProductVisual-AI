import { create } from 'zustand';
import { api } from '../api.js';

// --- Initial State ---
// Defining state outside is a clean pattern
const initialState = {
  user: null,
  loading: false, // This will be true for *any* auth-related API call
  error: null,
  isInitialized: false, // Tracks if we have run the initial auth check
};

// --- Store Creation ---
export const useAuthStore = create((set, get) => ({
  ...initialState,

  // --- ACTIONS ---

  /**
   * ACTION: checkAuth
   * DESCRIPTION: Runs on app load. Checks if a user is already logged in
   * via an HttpOnly cookie. This is the "initialization" step.
   * It's designed to be called from your app's main entry point (e.g., _app.js).
   */
  checkAuth: async () => {
    // Prevent re-checking if already initialized
    if (get().isInitialized) return;

    try {
      // We don't use fetchUser here because we want to
      // *silently* handle the "not logged in" error.
      set({ loading: true }); // Start loading
      const data = await api.me();
      set({ user: data.user || null, loading: false, isInitialized: true });
    } catch (err) {
      // This is an *expected* error if the user is not logged in.
      // We set the user to null and mark as initialized.
      set({ user: null, loading: false, isInitialized: true, error: null });
    }
  },

  /**
   * ACTION: fetchUser
   * DESCRIPTION: A simple, reusable action to get the current user.
   * NOTE: This action now *throws* errors. It does NOT
   * have its own try/catch. This is intentional.
   * It lets the *calling* action (like `login`) handle the error.
   */
  fetchUser: async () => {
    const data = await api.me();
    set({ user: data.user || null });
    return data.user || null;
  },

  /**
   * ACTION: login
   * DESCRIPTION: Logs the user in and then fetches their data.
   */
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await api.login(email, password);
      // Now that the cookie is set, call fetchUser
      const user = await get().fetchUser(); // `fetchUser` updates the state
      set({ loading: false }); // All done
      return user;
    } catch (err) {
      set({ error: err.message || 'Login failed', loading: false, user: null });
      throw err; // Re-throw for the UI component to handle
    }
  },

  /**
   * ACTION: signup
   * DESCRIPTION: Creates a new user account.
   */
  signup: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.signup(email, password);
      set({ loading: false });
      // Note: Typically, signup does *not* log the user in.
      // They may need to verify their email first.
      return res;
    } catch (err) {
      set({ error: err.message || 'Signup failed', loading: false });
      throw err;
    }
  },

  /**
   * ACTION: logout
   * DESCRIPTION: Logs the user out and clears session state.
   */
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await api.logout();
      // We don't care about API errors; we're logging out anyway.
    } catch (err) {
      // Ignore errors, just reset the state
    } finally {
      // `finally` is key: always reset state.
      set({ ...initialState, isInitialized: true }); // Reset to initial state
    }
  },
}));