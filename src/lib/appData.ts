// P0 audit: prior live data sources were split across useAppData.ts, seedData.ts imports in
// AccountsPage, CreditsPage, CostsPage, DiscoveryPage, PlatformsPage, TopBar, plus mockAI.ts
// consumers in DashboardPage and ProjectDrawer. This module centralizes app data initialization,
// migration, and persistence for the live UI.

import {
  seedAccounts,
  seedCosts,
  seedDiscovery,
  seedModels,
  seedProjects,
  seedPromotions,
  seedPrompts,
  seedUpdates,
  type SeedAccount,
  type SeedProject,
  type SeedPrompt,
  type SeedUpdate,
} from "@/lib/seedData";
import { MOCK_STALL_ASSESSMENT, MOCK_WEEKLY_REVIEW, type StallAssessmentResult, type WeeklyReviewResult } from "@/lib/mockAI";

export interface ProjectUpdate {
  id: string;
  project_id: string;
  type: string;
  content: string;
  created_at: string;
}

export interface CostEntry {
  id: string;
  platform: string;
  amount: number;
  currency: string;
  entry_type: string;
  date: string;
  account_label: string;
  project_id: string | null;
  notes: string | null;
}

export interface PromotionEntry {
  id: string;
  provider: string;
  credit_type: string;
  amount: number;
  unit: string;
  freshness: string;
  expiry_date: string | null;
  source_type: string;
}

export interface ModelEntry {
  id: string;
  provider: string;
  model_name: string;
  model_id: string;
  best_for: string[];
  is_free_tier: boolean;
  freshness: string;
}

export interface DiscoveryEntry {
  id: string;
  title: string;
  category: string;
  relevance_score: number;
  summary: string;
  date_seen: string;
  is_bookmarked: boolean;
  is_dismissed: boolean;
}

export interface StoredStallAssessment {
  id: string;
  project_id: string;
  result: StallAssessmentResult;
  generated_at: string;
  source: "demo" | "live";
  model_label: string;
}

export interface StoredWeeklyReview {
  id: string;
  result: WeeklyReviewResult;
  generated_at: string;
  source: "demo" | "live";
  model_label: string;
}

export interface RecentlyDeletedPayload {
  expiresAt: number;
  project: SeedProject;
  updates: ProjectUpdate[];
  prompts: SeedPrompt[];
  costs: CostEntry[];
  assessments: StoredStallAssessment[];
}

export interface AppStoreState {
  isDemoMode: boolean;
  projects: SeedProject[];
  prompts: SeedPrompt[];
  updates: ProjectUpdate[];
  accounts: SeedAccount[];
  costs: CostEntry[];
  promotions: PromotionEntry[];
  models: ModelEntry[];
  discovery: DiscoveryEntry[];
  stallAssessments: StoredStallAssessment[];
  weeklyReview: StoredWeeklyReview | null;
  recentlyDeleted: RecentlyDeletedPayload | null;
}

export const APP_STORE_KEY = "vibe-control.app-store.v1";
const LEGACY_MIGRATION_KEY = "vibe-control.migrated-name-relationships.v1";

const demoProjectIdByName = new Map(seedProjects.map((project) => [project.name, project.id]));

export function initDemoData(): Omit<AppStoreState, "isDemoMode" | "recentlyDeleted"> {
  return {
    projects: seedProjects,
    prompts: seedPrompts,
    updates: seedUpdates.map((update) => ({
      id: update.id,
      project_id: demoProjectIdByName.get(update.project_name) ?? "",
      type: update.type,
      content: update.content,
      created_at: update.created_at,
    })).filter((update) => update.project_id),
    accounts: seedAccounts,
    costs: seedCosts.map((cost) => ({
      id: cost.id,
      platform: cost.platform,
      amount: cost.amount,
      currency: cost.currency,
      entry_type: cost.entry_type,
      date: cost.date,
      account_label: cost.account_label,
      project_id: cost.project_name ? demoProjectIdByName.get(cost.project_name) ?? null : null,
      notes: cost.notes ?? null,
    })),
    promotions: seedPromotions,
    models: seedModels,
    discovery: seedDiscovery,
    stallAssessments: [
      {
        id: "demo-assessment-rx",
        project_id: demoProjectIdByName.get("Clinic Workflow Tracker") ?? seedProjects[0].id,
        result: MOCK_STALL_ASSESSMENT,
        generated_at: new Date().toISOString(),
        source: "demo",
        model_label: "Sample Analysis (Demo)",
      },
    ],
    weeklyReview: {
      id: "demo-weekly-review",
      result: MOCK_WEEKLY_REVIEW,
      generated_at: new Date().toISOString(),
      source: "demo",
      model_label: "Sample Review (Demo)",
    },
  };
}

export function createInitialAppState(): AppStoreState {
  const demo = initDemoData();
  return {
    isDemoMode: true,
    ...demo,
    recentlyDeleted: null,
  };
}

function migrateLegacyData(raw: unknown): AppStoreState {
  if (!raw || typeof raw !== "object") {
    return createInitialAppState();
  }

  const legacy = raw as Partial<{
    isDemoMode: boolean;
    projects: SeedProject[];
    prompts: SeedPrompt[];
    updates: Array<SeedUpdate | ProjectUpdate>;
    accounts: SeedAccount[];
    costs: Array<CostEntry | { id: string; platform: string; amount: number; currency: string; entry_type: string; date: string; account_label: string; project_name?: string | null; notes?: string | null }>;
    promotions: PromotionEntry[];
    models: ModelEntry[];
    discovery: DiscoveryEntry[];
    stallAssessments: StoredStallAssessment[];
    weeklyReview: StoredWeeklyReview | null;
    recentlyDeleted: RecentlyDeletedPayload | null;
  }>;

  const base = createInitialAppState();
  const projects = legacy.projects && legacy.projects.length > 0 ? legacy.projects : base.projects;
  const projectIdByName = new Map(projects.map((project) => [project.name, project.id]));

  const updates = (legacy.updates ?? base.updates)
    .map((update) => {
      if ("project_id" in update && typeof update.project_id === "string") {
        return update as ProjectUpdate;
      }

      const legacyUpdate = update as SeedUpdate;
      const projectId = projectIdByName.get(legacyUpdate.project_name);
      if (!projectId) return null;
      return {
        id: legacyUpdate.id,
        project_id: projectId,
        type: legacyUpdate.type,
        content: legacyUpdate.content,
        created_at: legacyUpdate.created_at,
      } satisfies ProjectUpdate;
    })
    .filter((update): update is ProjectUpdate => Boolean(update));

  const costs = (legacy.costs ?? base.costs).map((entry) => {
    if ("project_id" in entry) {
      return entry as CostEntry;
    }

    const legacyCost = entry as { id: string; platform: string; amount: number; currency: string; entry_type: string; date: string; account_label: string; project_name?: string | null; notes?: string | null };
    return {
      id: legacyCost.id,
      platform: legacyCost.platform,
      amount: legacyCost.amount,
      currency: legacyCost.currency,
      entry_type: legacyCost.entry_type,
      date: legacyCost.date,
      account_label: legacyCost.account_label,
      project_id: legacyCost.project_name ? projectIdByName.get(legacyCost.project_name) ?? null : null,
      notes: legacyCost.notes ?? null,
    } satisfies CostEntry;
  });

  if (typeof window !== "undefined" && !window.localStorage.getItem(LEGACY_MIGRATION_KEY)) {
    console.info("[vibe-control] migrated legacy name-based relationships to ID-based references");
    window.localStorage.setItem(LEGACY_MIGRATION_KEY, "true");
  }

  return {
    isDemoMode: legacy.isDemoMode ?? false,
    projects,
    prompts: legacy.prompts && legacy.prompts.length > 0 ? legacy.prompts : base.prompts,
    updates,
    accounts: legacy.accounts && legacy.accounts.length > 0 ? legacy.accounts : base.accounts,
    costs,
    promotions: legacy.promotions && legacy.promotions.length > 0 ? legacy.promotions : base.promotions,
    models: legacy.models && legacy.models.length > 0 ? legacy.models : base.models,
    discovery: legacy.discovery && legacy.discovery.length > 0 ? legacy.discovery : base.discovery,
    stallAssessments: legacy.stallAssessments ?? base.stallAssessments,
    weeklyReview: legacy.weeklyReview ?? base.weeklyReview,
    recentlyDeleted: legacy.recentlyDeleted ?? null,
  };
}

export function loadAppState(): AppStoreState {
  if (typeof window === "undefined") {
    return createInitialAppState();
  }

  const stored = window.localStorage.getItem(APP_STORE_KEY);
  if (!stored) {
    return createInitialAppState();
  }

  try {
    return migrateLegacyData(JSON.parse(stored));
  } catch {
    return createInitialAppState();
  }
}
