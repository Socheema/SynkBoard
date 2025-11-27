import { create } from 'zustand';

export const useWidgetStore = create((set, get) => ({
  // State
  widgets: [],
  layouts: {}, // Grid layouts for different breakpoints

  // Actions
  setWidgets: (widgets) => set({ widgets }),

  addWidget: (widget) =>
    set((state) => ({
      widgets: [...state.widgets, widget],
    })),

  updateWidget: (id, updates) =>
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    })),

  deleteWidget: (id) =>
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== id),
    })),

  updateLayout: (newLayout) =>
    set({ layouts: newLayout }),

  // Get widget by ID
  getWidget: (id) => {
    return get().widgets.find((w) => w.id === id);
  },

  reset: () =>
    set({
      widgets: [],
      layouts: {},
    }),
}));
