// Mock AI helper — returns structured JSON matching the real edge function interfaces.
// Replace with real API calls in v2.

export interface StallAssessmentResult {
  stall_causes: Array<{
    cause: string;
    probability: 'high' | 'medium' | 'low';
    explanation: string;
  }>;
  smallest_next_step: string;
  recovery_plan: string[];
  recommendation: 'salvage' | 'pause' | 'restart' | 'abandon';
  switch_platform: boolean;
  switch_account: boolean;
  reduce_scope: boolean;
  prompting_is_main_issue: boolean;
  technical_debt_is_main_issue: boolean;
  rescue_score: number;
  fix_prompt: string;
}

export interface WeeklyReviewResult {
  losing_momentum: string[];
  available_credits: string[];
  worth_rescuing: string[];
  ignore_this_week: string[];
  recommended_focus: string[];
}

export const MOCK_STALL_ASSESSMENT: StallAssessmentResult = {
  stall_causes: [
    {
      cause: "Schema complexity outgrew the initial design",
      probability: "high",
      explanation: "The prescription → dispense → stock relationship wasn't designed for the dispensing module. Adding it post-hoc created circular references that broke the existing queries.",
    },
    {
      cause: "Scope creep from dispensing module",
      probability: "medium",
      explanation: "The dispensing module pulled in stock management, which wasn't in the original plan. The project expanded without adjusting the timeline or architecture.",
    },
    {
      cause: "Auth integration distracted from core flow",
      probability: "low",
      explanation: "Getting auth working consumed a week, and momentum was lost before the schema issues were addressed.",
    },
  ],
  smallest_next_step: "Draw the entity-relationship diagram for just prescription → dispense (ignore stock for now). Confirm it works with 3 test records before touching any UI.",
  recovery_plan: [
    "Map the current schema to identify exactly which relationships are broken",
    "Design a simplified schema for prescription → dispense only (no stock management yet)",
    "Write a migration to restructure the tables",
    "Update the existing CRUD operations to work with the new schema",
    "Add stock management as a separate, optional module later",
  ],
  recommendation: "salvage",
  switch_platform: false,
  switch_account: false,
  reduce_scope: true,
  prompting_is_main_issue: false,
  technical_debt_is_main_issue: true,
  rescue_score: 68,
  fix_prompt: "The data model for RxTracker Pro needs restructuring. The current schema has a prescription table, a dispense table, and a stock table with circular references that break queries. I need you to: 1) Review the current schema I'll paste below. 2) Propose a cleaner prescription → dispense relationship that doesn't require stock management. 3) Write the migration SQL. 4) Update any affected queries. Do NOT add any new features — only fix the schema. Current schema: [paste schema here]",
};

export const MOCK_WEEKLY_REVIEW: WeeklyReviewResult = {
  losing_momentum: [
    "Compounding Price Scraper — 18 days stalled, the Playwright approach hasn't been tried yet",
    "Patient Consent Form Builder — 22 days paused, waiting on credits or platform migration",
    "OpenClaw Prompt Pipeline — 9 days since last touch, needs architecture review not more tinkering",
  ],
  available_credits: [
    "Alt Dev account has unused Manus credits — good for Manus Research Workflow",
    "Replit daily credits resetting — Pharmacy account still active",
    "Lovable monthly credits at ~60% remaining",
  ],
  worth_rescuing: [
    "RxTracker Pro (rescue score 68) — high monetisation potential, just needs a schema rethink",
    "Patient Consent Form Builder (rescue score 58) — the core builder works, move to Lovable if Base44 credits are gone",
  ],
  ignore_this_week: [
    "eBay Listing Automator — abandoned for good reason, massive scope blowout",
    "Manus Research Workflow — still just an idea, no urgency",
  ],
  recommended_focus: [
    "Ship the BurkePharma mobile layout — it's 90% done and has real business value",
    "Unblock RxTracker Pro with the schema fix — high confidence, high monetisation",
    "Keep VibeCodeTracker momentum going — it's tracking its own progress now",
  ],
};

type MockType = 'stall_assessment' | 'weekly_review';

export function mockAI(type: MockType): Promise<StallAssessmentResult | WeeklyReviewResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (type === 'stall_assessment') {
        resolve(MOCK_STALL_ASSESSMENT);
      } else {
        resolve(MOCK_WEEKLY_REVIEW);
      }
    }, 1500); // Simulate network delay
  });
}
