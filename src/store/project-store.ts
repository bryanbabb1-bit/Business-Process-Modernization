import { create } from "zustand";
import type {
  Project,
  CreateProjectInput,
  DiscoveryData,
  Recommendation,
} from "@/types";

interface ProjectStore {
  // Project list
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  // Current project context
  currentProject: Project | null;
  currentDiscovery: DiscoveryData | null;
  selectedRecommendations: Recommendation[];

  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setCurrentDiscovery: (discovery: DiscoveryData | null) => void;
  setSelectedRecommendations: (recs: Recommendation[]) => void;
  toggleRecommendation: (rec: Recommendation) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API helpers
  fetchProjects: () => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,
  currentProject: null,
  currentDiscovery: null,
  selectedRecommendations: [],

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setCurrentDiscovery: (discovery) => set({ currentDiscovery: discovery }),
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
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      set({ projects: data, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  createProject: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const project = await res.json();
      set((state) => ({
        projects: [project, ...state.projects],
        isLoading: false,
      }));
      return project;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        isLoading: false,
      });
      return null;
    }
  },

  deleteProject: async (id) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
}));
