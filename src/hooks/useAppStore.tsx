import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import {
  APP_STORE_KEY,
  createInitialAppState,
  initDemoData,
  loadAppState,
  type AppStoreState,
  type CostEntry,
  type ProjectUpdate,
  type RecentlyDeletedPayload,
  type StoredStallAssessment,
  type StoredWeeklyReview,
} from "@/lib/appData";
import { withDerivedProjectFields, type SeedProject, type SeedPrompt } from "@/lib/seedData";

interface AppStoreContextValue {
  state: AppStoreState;
  actions: {
    setProjects: (value: SeedProject[] | ((prev: SeedProject[]) => SeedProject[])) => void;
    setPrompts: (value: SeedPrompt[] | ((prev: SeedPrompt[]) => SeedPrompt[])) => void;
    setUpdates: (value: ProjectUpdate[] | ((prev: ProjectUpdate[]) => ProjectUpdate[])) => void;
    addStallAssessment: (assessment: StoredStallAssessment) => void;
    setWeeklyReview: (review: StoredWeeklyReview | null) => void;
    exitDemoMode: () => void;
    resetToDemo: () => void;
    deleteProjectCascade: (projectId: string) => RecentlyDeletedPayload | null;
    restoreRecentlyDeleted: () => void;
    clearRecentlyDeleted: () => void;
  };
}

type AppStoreAction =
  | { type: "hydrate"; payload: AppStoreState }
  | { type: "set-projects"; payload: SeedProject[] }
  | { type: "set-prompts"; payload: SeedPrompt[] }
  | { type: "set-updates"; payload: ProjectUpdate[] }
  | { type: "add-assessment"; payload: StoredStallAssessment }
  | { type: "set-weekly-review"; payload: StoredWeeklyReview | null }
  | { type: "exit-demo-mode" }
  | { type: "reset-demo" }
  | { type: "delete-project"; payload: RecentlyDeletedPayload }
  | { type: "restore-recently-deleted" }
  | { type: "clear-recently-deleted" };

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

function normalizeProjects(projects: SeedProject[]) {
  return projects.map((project) => withDerivedProjectFields(project));
}

function reducer(state: AppStoreState, action: AppStoreAction): AppStoreState {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "set-projects":
      return { ...state, projects: normalizeProjects(action.payload) };
    case "set-prompts":
      return { ...state, prompts: action.payload };
    case "set-updates":
      return { ...state, updates: action.payload };
    case "add-assessment":
      return {
        ...state,
        stallAssessments: [action.payload, ...state.stallAssessments.filter((item) => item.id !== action.payload.id)],
      };
    case "set-weekly-review":
      return { ...state, weeklyReview: action.payload };
    case "exit-demo-mode":
      return {
        ...state,
        isDemoMode: false,
        projects: [],
        prompts: [],
        updates: [],
        accounts: [],
        costs: [],
        promotions: [],
        models: [],
        discovery: [],
        stallAssessments: [],
        weeklyReview: null,
        recentlyDeleted: null,
      };
    case "reset-demo": {
      const demo = initDemoData();
      return {
        isDemoMode: true,
        ...demo,
        recentlyDeleted: null,
      };
    }
    case "delete-project": {
      const projectId = action.payload.project.id;
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== projectId),
        updates: state.updates.filter((update) => update.project_id !== projectId),
        prompts: state.prompts.filter((prompt) => !prompt.linked_project_ids.includes(projectId)),
        costs: state.costs.filter((cost) => cost.project_id !== projectId),
        stallAssessments: state.stallAssessments.filter((assessment) => assessment.project_id !== projectId),
        recentlyDeleted: action.payload,
      };
    }
    case "restore-recently-deleted": {
      if (!state.recentlyDeleted) return state;
      return {
        ...state,
        projects: [state.recentlyDeleted.project, ...state.projects],
        updates: [...state.recentlyDeleted.updates, ...state.updates],
        prompts: [...state.recentlyDeleted.prompts, ...state.prompts],
        costs: [...state.recentlyDeleted.costs, ...state.costs],
        stallAssessments: [...state.recentlyDeleted.assessments, ...state.stallAssessments],
        recentlyDeleted: null,
      };
    }
    case "clear-recently-deleted":
      return { ...state, recentlyDeleted: null };
    default:
      return state;
  }
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadAppState);

  useEffect(() => {
    window.localStorage.setItem(APP_STORE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!state.recentlyDeleted) return;
    const timeout = window.setTimeout(() => {
      dispatch({ type: "clear-recently-deleted" });
    }, Math.max(0, state.recentlyDeleted.expiresAt - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [state.recentlyDeleted]);

  const value = useMemo<AppStoreContextValue>(() => ({
    state,
    actions: {
      setProjects: (value) => {
        const next = typeof value === "function" ? value(state.projects) : value;
        dispatch({ type: "set-projects", payload: next });
      },
      setPrompts: (value) => {
        const next = typeof value === "function" ? value(state.prompts) : value;
        dispatch({ type: "set-prompts", payload: next });
      },
      setUpdates: (value) => {
        const next = typeof value === "function" ? value(state.updates) : value;
        dispatch({ type: "set-updates", payload: next });
      },
      addStallAssessment: (assessment) => dispatch({ type: "add-assessment", payload: assessment }),
      setWeeklyReview: (review) => dispatch({ type: "set-weekly-review", payload: review }),
      exitDemoMode: () => dispatch({ type: "exit-demo-mode" }),
      resetToDemo: () => dispatch({ type: "reset-demo" }),
      deleteProjectCascade: (projectId) => {
        const project = state.projects.find((item) => item.id === projectId);
        if (!project) return null;
        const payload: RecentlyDeletedPayload = {
          expiresAt: Date.now() + 60000,
          project,
          updates: state.updates.filter((update) => update.project_id === projectId),
          prompts: state.prompts.filter((prompt) => prompt.linked_project_ids.includes(projectId)),
          costs: state.costs.filter((cost) => cost.project_id === projectId),
          assessments: state.stallAssessments.filter((assessment) => assessment.project_id === projectId),
        };
        dispatch({ type: "delete-project", payload });
        return payload;
      },
      restoreRecentlyDeleted: () => dispatch({ type: "restore-recently-deleted" }),
      clearRecentlyDeleted: () => dispatch({ type: "clear-recently-deleted" }),
    },
  }), [state]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return context;
}

export function useProjects() {
  const { state, actions } = useAppStore();
  return [state.projects, actions.setProjects] as const;
}

export function usePrompts() {
  const { state, actions } = useAppStore();
  return [state.prompts, actions.setPrompts] as const;
}

export function useUpdates() {
  const { state, actions } = useAppStore();
  return [state.updates, actions.setUpdates] as const;
}

export function useAccounts() {
  const { state } = useAppStore();
  return state.accounts;
}

export function useCosts() {
  const { state } = useAppStore();
  return state.costs;
}

export function usePromotions() {
  const { state } = useAppStore();
  return state.promotions;
}

export function useModels() {
  const { state } = useAppStore();
  return state.models;
}

export function useDiscovery() {
  const { state } = useAppStore();
  return state.discovery;
}

export function useAssessments() {
  const { state } = useAppStore();
  return state.stallAssessments;
}

export function useWeeklyReview() {
  const { state } = useAppStore();
  return state.weeklyReview;
}
