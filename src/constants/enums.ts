// P1-B / P3-B — Centralised enumerations and constants
// Replaces all ad-hoc string literals used for filtering/matching across the app.

export const PROJECT_STATUSES = [
  "idea",
  "planning",
  "building",
  "testing",
  "launched",
  "paused",
  "stalled",
  "abandoned",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_TYPES = [
  "web_app",
  "mobile_app",
  "automation",
  "website_revamp",
  "scraping_tool",
  "api_integration",
  "pharmacy_business",
  "research_workflow",
  "other",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const UPDATE_TYPES = ["note", "status_change", "assessment"] as const;
export type UpdateType = (typeof UPDATE_TYPES)[number];

export const ACCOUNT_LABELS = ["Primary", "Ops", "Alt Dev"] as const;
export type AccountLabel = (typeof ACCOUNT_LABELS)[number];

export const PROMPT_CATEGORIES = ["rescue", "debugging", "ui", "research", "workflow"] as const;
export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];

export const TAG_OPTIONS = [
  "urgent",
  "rescue",
  "pharmacy",
  "internal",
  "ai",
  "credits",
  "client",
] as const;
export type TagOption = (typeof TAG_OPTIONS)[number];

export const PLATFORM_NAMES = [
  "Lovable",
  "Replit",
  "Base44",
  "Manus",
  "Bolt",
  "v0",
  "Cursor",
  "VS Code + Copilot",
  "OpenRouter",
] as const;
export type PlatformName = (typeof PLATFORM_NAMES)[number];

export const CREDIT_FRESHNESS = ["confirmed", "expired", "unconfirmed"] as const;
export type CreditFreshness = (typeof CREDIT_FRESHNESS)[number];

export const AI_RECOMMENDATION = ["salvage", "pause", "restart", "abandon"] as const;
export type AIRecommendation = (typeof AI_RECOMMENDATION)[number];

export const AI_PROBABILITY = ["high", "medium", "low"] as const;
export type AIProbability = (typeof AI_PROBABILITY)[number];
