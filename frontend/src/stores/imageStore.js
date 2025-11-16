import { create } from 'zustand';
import { api } from '../api.js';

// --- Initial State ---
// Define a clean initial state. This is great for resetting.
const initialState = {
  // Generation state
  prompt: '',
  originalPrompt: '',
  enhancedPrompt: '',
  imageUrl: null, // The result of the *last* generation

  // List state
  images: [], // This will *only* hold the current page's images
  loadingList: false, // For fetching the list
  loadingEnhance: false,
  loadingGenerate: false,
  error: null,

  // Server-side pagination state
  pagination: {
    currentPage: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0,
  },
};

// --- Store Creation ---
export const useImageStore = create((set, get) => ({
  ...initialState,

  // --- ACTIONS ---

  /**
   * ACTION: clearGenerationState
   * DESCRIPTION: Resets the prompt and imageURL fields, ready for a new generation.
   * This is what components should call, NOT manual setters.
   */
  clearGenerationState: () => {
    set({
      prompt: '',
      originalPrompt: '',
      enhancedPrompt: '',
      imageUrl: null,
      error: null,
    });
  },

  /**
   * ACTION: setPrompt (Encapsulated)
   * DESCRIPTION: The *only* action that should set the main prompt.
   */
  setPrompt: (prompt) => set({ prompt }),

  /**
   * ACTION: fetchGenerations (Server-side Pagination)
   * DESCRIPTION: Fetches a *single* page of generations from the server.
   * This REPLACES fetchAllGenerations and fetchPage.
   */
  fetchGenerations: async (page, pageSize) => {
    const { pagination } = get();
    const newPage = page || pagination.currentPage;
    const newPageSize = pageSize || pagination.pageSize;

    set({ loadingList: true, error: null });
    try {
      // We assume the API now supports this:
      // e.g., GET /api/generations?page=1&limit=12
      const data = await api.getGenerations({
        page: newPage,
        perPage: newPageSize,
      });

      // We assume the API returns a response like:
      // {
      //   generations: [...],
      //   totalItems: 100,
      //   totalPages: 9,
      //   currentPage: 1
      // }
      set({
        images: data.generations || [],
        pagination: {
          currentPage: data.currentPage || newPage,
          pageSize: newPageSize,
          totalItems: data.totalItems || 0,
          totalPages: data.totalPages || 0,
        },
        loadingList: false,
      });
    } catch (err) {
      set({ loadingList: false, error: err.message || 'Failed to fetch' });
      throw err;
    }
  },

  /**
   * ACTION: deleteImage
   * DESCRIPTION: Deletes an image and then intelligently refreshes the list.
   */
  deleteImage: async (id) => {
    set({ loadingList: true, error: null });
    try {
      await api.deleteGeneration(id);
      
      // After delete, refetch the *current* page
      await get().fetchGenerations();
      
      // Best Practice: Check if we deleted the last item on a page
      const { images, pagination } = get();
      if (images.length === 0 && pagination.currentPage > 1) {
        // If the page is now empty, go to the previous page
        await get().fetchGenerations(pagination.currentPage - 1);
      }
    } catch (err) {
      set({ error: err.message || 'Delete failed' });
      throw err;
    } finally {
      set({ loadingList: false });
    }
  },

  /**
   * ACTION: enhancePrompt
   * DESCRIPTION: Gets an enhanced prompt from the server.
   */
  enhancePrompt: async (promptToEnhance) => {
    set({ loadingEnhance: true, error: null, originalPrompt: promptToEnhance });
    try {
      const data = await api.enhance(promptToEnhance);
      const enhancedPrompt = data.enhancedPrompt;
      set({ enhancedPrompt, loadingEnhance: false });
      return enhancedPrompt;
    } catch (err) {
      set({ loadingEnhance: false, error: err.message || 'Enhance failed' });
      throw err;
    }
  },

  /**
   * ACTION: generateImage
   * DESCRIPTION: Generates a new image and refreshes the list.
   */
  generateImage: async (body) => {
    set({ loadingGenerate: true, error: null, imageUrl: null });
    try {
      const data = await api.generate(body);

      // Find the resulting image URL (your logic was fine)
      const imageUrl = data?.imageUrl || data?.url || data?.result?.imageUrl || data?.result?.url || null;
      
      set({ imageUrl, loadingGenerate: false });

      // Best Practice: Refresh Page 1 to show the new image.
      // This is *much* faster than refetching all.
      if (get().pagination.currentPage === 1) {
        await get().fetchGenerations(1);
      } else {
        // If user is on another page, just set page 1 as the
        // target so it's there when they go back.
        set(state => ({
          pagination: { ...state.pagination, currentPage: 1 }
        }));
        await get().fetchGenerations(1);
      }
      
      return data;
    } catch (err) {
      set({ loadingGenerate: false, error: err.message || 'Generate failed' });
      throw err;
    }
  }
}));