import { create } from 'zustand';

export const useWidgetStore = create((set, get) => ({
  // State
  widgets: [],
  layouts: {}, // Grid layouts for different breakpoints

  // Actions
  setWidgets: (widgets) => {
    console.log('📦 Setting widgets:', widgets.length);
    set({ widgets });
  },

  addWidget: (widget) => {
    console.log('➕ Adding widget:', widget.id);
    set((state) => {
      // Check if widget already exists (prevent duplicates)
      const exists = state.widgets.some(w => w.id === widget.id);
      if (exists) {
        console.log('⚠️ Widget already exists, skipping add');
        return state;
      }
      return {
        widgets: [...state.widgets, widget],
      };
    });
  },

  updateWidget: (id, updates) => {
    console.log('🔄 Updating widget:', id);
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    }));
  },

  deleteWidget: (id) => {
    console.log('🗑️ Deleting widget:', id);
    set((state) => {
      const newWidgets = state.widgets.filter((w) => w.id !== id);
      console.log('📦 Widgets after delete:', newWidgets.length);
      return { widgets: newWidgets };
    });
  },

  updateLayout: (newLayout) =>
    set({ layouts: newLayout }),

  // Get widget by ID
  getWidget: (id) => {
    return get().widgets.find((w) => w.id === id);
  },

  reset: () => {
    console.log('🔄 Resetting widget store');
    set({
      widgets: [],
      layouts: {},
    });
  },
}));
