import { create } from "zustand";
import type {
  Project,
  CreateProjectInput,
  Recommendation,
} from "@/types";

interface ProjectStore {
  // Project list
  projects: Project[];
  isFetchingProjects: boolean;
  isCreatingProject: boolean;
  isDeletingProject: boolean;
  error: string | null;

  // Current project context
  currentProject: Project | null;
  selectedRecommendations: Recommendation[];

  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setSelectedRecommendations: (recs: Recommendation[]) => void;
  toggleRecommendation: (rec: Recommendation) => void;
  setError: (error: string | null) => void;

  // API helpers
  fetchProjects: () => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  isFetchingProjects: false,
  isCreatingProject: false,
  isDeletingProject: false,
  error: null,
  currentProject: null,
  selectedRecommendations: [],

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setSelectedRecommendations: (recs) =>
    set({ selectedRecommendations: recs }),
  toggleRecommendation: (rec) => {
    const current = get().selectedRecommendations;
    const exists = current.find((r) => r.id === rec.id);
    if (exists) {
      set({
        selectedRecommendations: current.filter((r) => r.id !== rec.id),
      });
    } else {
      set({ selectedRecommendations: [...current, rec] });
    }
  },
  setError: (error) => set({ error }),

  fetchProjects: async () => {
    set({ isFetchingProjects: true, error: null });
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      set({ projects: data, isFetchingProjects: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        isFetchingProjects: false,
      });
    }
  },

  createProject: async (input) => {
    set({ isCreatingProject: true, error: null });
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create project");
      }
      const project = await res.json();
      set((state) => ({
        projects: [project, ...state.projects],
        isCreatingProject: false,
      }));
      return project;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        isCreatingProject: false,
      });
      return null;
    }
  },

  deleteProject: async (id) => {
    set({ isDeletingProject: true, error: null });
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to delete project");
      }
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        isDeletingProject: false,
      }));
      return true;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        isDeletingProject: false,
      });
      return false;
    }
  },
}));
