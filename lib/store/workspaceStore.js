import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      // State
      currentWorkspace: null,
      workspaces: [],
      members: [],

      // Actions
      setCurrentWorkspace: (workspace) =>
        set({ currentWorkspace: workspace }),

      setWorkspaces: (workspaces) =>
        set({ workspaces }),

      addWorkspace: (workspace) =>
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
        })),

      setMembers: (members) =>
        set({ members }),

      // Clear on logout
      reset: () =>
        set({
          currentWorkspace: null,
          workspaces: [],
          members: [],
        }),
    }),
    {
      name: 'workspace-storage', // localStorage key
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace
      }), // Only persist this
    }
  )
);
