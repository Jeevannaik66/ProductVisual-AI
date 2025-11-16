import { create } from 'zustand';
import { api } from '../api.js';

export const useImageStore = create((set, get) => ({
  prompt: '',
  originalPrompt: '',
  enhancedPrompt: '',
  imageUrl: null,
  images: [],
  loading: false,
  loadingEnhance: false,
  loadingGenerate: false,
  page: 1,
  perPage: 12,
  total: 0,
  error: null,

  setPrompt: (p) => set({ prompt: p }),
  setOriginalPrompt: (p) => set({ originalPrompt: p }),
  setEnhancedPrompt: (p) => set({ enhancedPrompt: p }),
  setImageUrl: (u) => set({ imageUrl: u }),

  fetchAllGenerations: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getGenerations();
      const items = data.generations || [];
      set({ images: items, total: items.length, loading: false });
      return items;
    } catch (err) {
      set({ loading: false, error: err.message || 'Failed to fetch' });
      throw err;
    }
  },

  fetchPage: async (page = 1, perPage = undefined) => {
    const p = perPage ?? get().perPage;
    set({ loading: true, page, error: null });
    try {
      const all = await get().fetchAllGenerations();
      const start = (page - 1) * p;
      const slice = all.slice(start, start + p);
      set({ images: slice, total: all.length, loading: false });
      return slice;
    } catch (err) {
      set({ loading: false, error: err.message || 'Failed to fetch page' });
      throw err;
    }
  },

  deleteImage: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteGeneration(id);
      // refresh page
      await get().fetchPage(get().page);
    } catch (err) {
      set({ error: err.message || 'Delete failed' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  enhancePrompt: async (promptToEnhance) => {
    set({ loadingEnhance: true, error: null });
    try {
      const data = await api.enhance(promptToEnhance);
      set({ enhancedPrompt: data.enhancedPrompt, originalPrompt: promptToEnhance, loadingEnhance: false });
      return data.enhancedPrompt;
    } catch (err) {
      set({ loadingEnhance: false, error: err.message || 'Enhance failed' });
      throw err;
    }
  },

  generateImage: async (body) => {
    // clear previous image while generating
    set({ loadingGenerate: true, error: null, imageUrl: null });
    try {
      const data = await api.generate(body);
      // api.generate may return an image url or generated object; try to persist imageUrl if present
      const imageUrl = data?.imageUrl || data?.url || data?.result?.imageUrl || data?.result?.url || null;
      if (imageUrl) {
        set({ imageUrl });
      }

      // refresh list (client-side pagination) so newly created generation appears
      try {
        await get().fetchPage(get().page);
      } catch (e) {
        // ignore refresh failures, we'll still return the generated data
      }

      set({ loadingGenerate: false });
      return data;
    } catch (err) {
      set({ loadingGenerate: false, error: err.message || 'Generate failed' });
      throw err;
    }
  }
}));

// prefer named export; do not default-export the hook
