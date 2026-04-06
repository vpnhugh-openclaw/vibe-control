// Seed data for VibeCodeTracker — used for demo/dev before real DB queries
// All dates are relative to "today"

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

export interface SeedProject {
  id: string;
  name: string;
  short_description: string;
  status: string;
  project_type: string;
  platform_name: string;
  platform_logo_slug?: string;
  account_label: string;
  last_active_date: string;
  next_action: string | null;
  blocker_summary: string | null;
  confidence_score: number;
  motivation_score: number;
  monetisation_score: number;
  platform_fit_score: number;
  effort_score: number;
  rescue_score: number;
  is_stalled: boolean;
  priority: number;
}

export interface SeedAccount {
  id: string;
  label: string;
  email_address: string;
  login_method: string;
  preferred_use_case: string;
  best_for_platform: string;
  is_active: boolean;
  last_used_date: string;
}

export interface SeedUpdate {
  id: string;
  project_name: string;
  type: string;
  content: string;
  created_at: string;
}

export interface SeedPrompt {
  id: string;
  title: string;
  category: string;
  prompt_text: string;
  effectiveness_rating: number;
  linked_platforms: string[];
  linked_project_ids: string[];
  tags: string[];
  notes: string;
  date_added: string;
  last_used_date: string;
}

function computeRescueScore(p: { last_active_date: string; confidence_score: number; motivation_score: number; monetisation_score: number; platform_fit_score: number; effort_score: number }): number {
  const daysSince = Math.max(0, (today.getTime() - new Date(p.last_active_date).getTime()) / 86400000);
  const recency = Math.max(0, 10 - daysSince / 3);
  return Math.round(
    (recency * 0.25 +
      p.confidence_score * 0.20 +
      p.motivation_score * 0.15 +
      p.monetisation_score * 0.15 +
      (10 - p.effort_score) * 0.15 +
      p.platform_fit_score * 0.10) * 10
  );
}

const projectsRaw = [
  { id: "p1", name: "RxTracker Pro", short_description: "Prescription tracking and dispensing log for community pharmacy", status: "stalled", project_type: "web_app", platform_name: "Lovable", platform_logo_slug: "lovable", account_label: "Primary", last_active_date: daysAgo(11), next_action: "Redesign the dispensing log schema before writing any more UI", blocker_summary: "Got auth working but the schema went sideways when I added the dispensing module. The prescription → dispense → stock relationship needs a rethink before I go further.", confidence_score: 7, motivation_score: 8, monetisation_score: 9, platform_fit_score: 8, effort_score: 6, priority: 2 },
  { id: "p2", name: "BurkePharma Website Revamp", short_description: "Full site rebuild for Burke Road Compounding Pharmacy", status: "building", project_type: "website_revamp", platform_name: "VS Code + Copilot", platform_logo_slug: "visualstudiocode", account_label: "Primary", last_active_date: daysAgo(2), next_action: "Finish mobile layout for the services section", blocker_summary: "Content is mostly done. Mobile layout still needs work on the services section and the hero image crops badly on 375px.", confidence_score: 9, motivation_score: 7, monetisation_score: 8, platform_fit_score: 9, effort_score: 4, priority: 1 },
  { id: "p3", name: "Compounding Price Scraper", short_description: "Scrapes supplier catalogues for compounding ingredient pricing", status: "stalled", project_type: "scraping_tool", platform_name: "Replit", platform_logo_slug: "replit", account_label: "Pharmacy", last_active_date: daysAgo(18), next_action: "Try a Playwright-based approach instead of requests+BeautifulSoup", blocker_summary: "The base scraper works fine for simple pages but falls over on paginated supplier catalogues.", confidence_score: 6, motivation_score: 5, monetisation_score: 7, platform_fit_score: 6, effort_score: 7, priority: 3 },
  { id: "p4", name: "Patient Consent Form Builder", short_description: "Dynamic consent form builder for pharmacy clinical services", status: "paused", project_type: "web_app", platform_name: "Base44", account_label: "Pharmacy", last_active_date: daysAgo(22), next_action: "Either top up Base44 credits or migrate to Lovable with the pharmacy account", blocker_summary: "Ran out of Base44 credits about two-thirds through. The core builder works, the PDF export is half-done.", confidence_score: 7, motivation_score: 6, monetisation_score: 8, platform_fit_score: 5, effort_score: 5, priority: 3 },
  { id: "p5", name: "TravelVax Booking Widget", short_description: "Travel vaccination appointment booking embedded on pharmacy site", status: "launched", project_type: "web_app", platform_name: "Lovable", platform_logo_slug: "lovable", account_label: "Primary", last_active_date: daysAgo(0), next_action: "Monitor booking conversion rate after the last UX update", blocker_summary: null, confidence_score: 9, motivation_score: 8, monetisation_score: 9, platform_fit_score: 9, effort_score: 2, priority: 1 },
  { id: "p6", name: "Manus Research Workflow", short_description: "Systematic review preparation workflow for travel medicine CPD", status: "idea", project_type: "research_workflow", platform_name: "Manus", account_label: "Alt Dev", last_active_date: daysAgo(30), next_action: "Draft the research brief and try a test run with Manus", blocker_summary: "Haven't started. Just a strong feeling that Manus would be good for this.", confidence_score: 5, motivation_score: 6, monetisation_score: 4, platform_fit_score: 7, effort_score: 5, priority: 4 },
  { id: "p7", name: "eBay Listing Automator", short_description: "Automated eBay listing tool for pharmacy clearance stock", status: "abandoned", project_type: "automation", platform_name: "Bolt", account_label: "Primary", last_active_date: daysAgo(45), next_action: null, blocker_summary: "Complete scope blowout. Started as a weekend project and turned into a monster.", confidence_score: 2, motivation_score: 1, monetisation_score: 3, platform_fit_score: 4, effort_score: 9, priority: 5 },
  { id: "p8", name: "Internal Staff Scheduler", short_description: "Shift scheduling tool for pharmacy staff with leave and availability tracking", status: "planning", project_type: "web_app", platform_name: "v0", account_label: "Primary", last_active_date: daysAgo(6), next_action: "Finalise the data model before starting the UI build", blocker_summary: null, confidence_score: 6, motivation_score: 5, monetisation_score: 6, platform_fit_score: 6, effort_score: 6, priority: 3 },
  { id: "p9", name: "Hugh's VibeCodeTracker", short_description: "This app — tracking its own development. Very meta.", status: "building", project_type: "web_app", platform_name: "Lovable", platform_logo_slug: "lovable", account_label: "Primary", last_active_date: daysAgo(0), next_action: "Get the stall diagnosis workflow properly wired to the mock AI", blocker_summary: null, confidence_score: 9, motivation_score: 9, monetisation_score: 7, platform_fit_score: 9, effort_score: 3, priority: 1 },
  { id: "p10", name: "OpenClaw Prompt Pipeline", short_description: "Local AI automation setup for chaining prompts across coding tasks", status: "stalled", project_type: "automation", platform_name: "Cursor", platform_logo_slug: "cursor", account_label: "Primary", last_active_date: daysAgo(9), next_action: "Write up the current architecture properly before changing anything else", blocker_summary: "The individual pieces work but the prompt chaining is inconsistent.", confidence_score: 6, motivation_score: 7, monetisation_score: 5, platform_fit_score: 8, effort_score: 6, priority: 2 },
];

export const seedProjects: SeedProject[] = projectsRaw.map((p) => ({
  ...p,
  rescue_score: computeRescueScore(p),
  is_stalled: new Date(p.last_active_date) < new Date(today.getTime() - 7 * 86400000),
}));

export const seedAccounts: SeedAccount[] = [
  { id: "a1", label: "Primary", email_address: "hughnicholls@gmail.com", login_method: "Google", preferred_use_case: "Main Lovable builds, Supabase, Vercel deployments", best_for_platform: "Lovable", is_active: true, last_used_date: daysAgo(0) },
  { id: "a2", label: "Pharmacy", email_address: "hugh.pharmacy@gmail.com", login_method: "Google", preferred_use_case: "Replit, Base44, Bolt free tiers for pharmacy tools", best_for_platform: "Replit", is_active: true, last_used_date: daysAgo(4) },
  { id: "a3", label: "Alt Dev", email_address: "hugh.dev.alt@gmail.com", login_method: "email", preferred_use_case: "Credit farming. Fresh Manus credits sitting unused.", best_for_platform: "Manus", is_active: true, last_used_date: daysAgo(19) },
];

export const seedUpdates: SeedUpdate[] = [
  { id: "u1", project_name: "TravelVax Booking Widget", type: "note", content: "Pushed the updated booking confirmation email template. Looks clean on mobile now.", created_at: new Date(today.getTime() - 2 * 3600000).toISOString() },
  { id: "u2", project_name: "Hugh's VibeCodeTracker", type: "note", content: "Got the dashboard KPI cards rendering with live data from Supabase. Next: rescue ranking panel.", created_at: new Date(today.getTime() - 4 * 3600000).toISOString() },
  { id: "u3", project_name: "BurkePharma Website Revamp", type: "status_change", content: "Status changed to building — content review approved by the pharmacist.", created_at: new Date(today.getTime() - 26 * 3600000).toISOString() },
  { id: "u4", project_name: "Internal Staff Scheduler", type: "note", content: "Sketched out the shift model. Need to handle split shifts and on-call separately.", created_at: new Date(today.getTime() - 48 * 3600000).toISOString() },
  { id: "u5", project_name: "OpenClaw Prompt Pipeline", type: "note", content: "Tried reversing the chain order — slightly better but still not consistent enough.", created_at: new Date(today.getTime() - 72 * 3600000).toISOString() },
  { id: "u6", project_name: "RxTracker Pro", type: "assessment", content: "Ran stall diagnosis. Main issue is schema complexity, not motivation. Rescue score: 68.", created_at: new Date(today.getTime() - 168 * 3600000).toISOString() },
  { id: "u7", project_name: "Compounding Price Scraper", type: "note", content: "The BeautifulSoup approach can't handle dynamic pagination. Need to switch to Playwright.", created_at: new Date(today.getTime() - 240 * 3600000).toISOString() },
  { id: "u8", project_name: "Patient Consent Form Builder", type: "status_change", content: "Paused — ran out of Base44 credits mid-build. Frustrating because it was going well.", created_at: new Date(today.getTime() - 360 * 3600000).toISOString() },
];

export const seedPrompts: SeedPrompt[] = [
  {
    id: "prm1",
    title: "Lovable schema rescue prompt",
    category: "rescue",
    prompt_text: "## Goal\nRefactor the schema without adding new features.\n\n### Constraints\n- keep the existing auth flow\n- do not add stock management yet\n- focus only on prescription -> dispense\n\n### Output\n1. revised schema\n2. migration SQL\n3. updated queries",
    effectiveness_rating: 5,
    linked_platforms: ["Lovable"],
    linked_project_ids: ["p1"],
    tags: ["schema", "rescue", "supabase"],
    notes: "Worked best when the current schema was pasted directly below the prompt.",
    date_added: daysAgo(2),
    last_used_date: daysAgo(1),
  },
  {
    id: "prm2",
    title: "Prompt for diagnosing flaky AI build chains",
    category: "debugging",
    prompt_text: "You are reviewing a multi-step AI workflow that produces inconsistent output.\n\nPlease identify:\n- where determinism is being lost\n- what to simplify\n- the smallest reproducible test case\n- a rewrite of the system prompt",
    effectiveness_rating: 4,
    linked_platforms: ["Cursor", "OpenRouter"],
    linked_project_ids: ["p10"],
    tags: ["debugging", "prompting", "workflow"],
    notes: "Solid for architecture reviews, less useful for UI generation.",
    date_added: daysAgo(9),
    last_used_date: daysAgo(6),
  },
  {
    id: "prm3",
    title: "Mobile layout polish pass",
    category: "ui",
    prompt_text: "Review this React + Tailwind screen at 375px width.\n\nReturn:\n- the 3 highest-impact overflow issues\n- exact class changes to fix them\n- any touch target problems\n- any spacing inconsistencies",
    effectiveness_rating: 4,
    linked_platforms: ["VS Code + Copilot", "Lovable"],
    linked_project_ids: ["p2", "p9"],
    tags: ["mobile", "ui", "tailwind"],
    notes: "Great for tightening final responsive polish.",
    date_added: daysAgo(5),
    last_used_date: daysAgo(2),
  },
  {
    id: "prm4",
    title: "Rescue prompt for paused credit-limited builds",
    category: "rescue",
    prompt_text: "This project is paused due to credit limits on the current platform.\n\nCompare these options:\n1. finish in place\n2. migrate to Lovable\n3. reduce scope and ship a smaller version\n\nReturn a recommendation with the lowest-effort path to launch.",
    effectiveness_rating: 3,
    linked_platforms: ["Base44", "Lovable"],
    linked_project_ids: ["p4"],
    tags: ["credits", "migration", "rescue"],
    notes: "Best when paired with a quick feature inventory first.",
    date_added: daysAgo(11),
    last_used_date: daysAgo(10),
  },
];

export const seedPromotions = [
  { id: "pr1", provider: "Lovable", credit_type: "monthly", amount: 2500, unit: "credits", freshness: "confirmed", expiry_date: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0], source_type: "manual" },
  { id: "pr2", provider: "Replit", credit_type: "daily", amount: 10, unit: "credits/day", freshness: "confirmed", expiry_date: null, source_type: "manual" },
  { id: "pr3", provider: "Base44", credit_type: "promo", amount: 500, unit: "credits", freshness: "expired", expiry_date: daysAgo(5), source_type: "manual" },
];

export const seedModels = [
  { id: "m1", provider: "Anthropic", model_name: "Claude Sonnet 4", model_id: "claude-sonnet-4-5", best_for: ["coding", "reasoning", "ui_generation"], is_free_tier: false, freshness: "confirmed" },
  { id: "m2", provider: "Google", model_name: "Gemini 2.0 Flash", model_id: "gemini-2.0-flash", best_for: ["research", "general"], is_free_tier: true, freshness: "confirmed" },
  { id: "m3", provider: "OpenRouter", model_name: "openrouter/auto", model_id: "openrouter/auto", best_for: ["general"], is_free_tier: false, freshness: "confirmed" },
  { id: "m4", provider: "Meta", model_name: "Llama 3.3 70B", model_id: "meta-llama/llama-3.3-70b-instruct:free", best_for: ["coding", "general"], is_free_tier: true, freshness: "confirmed" },
];

export const seedDiscovery = [
  { id: "d1", title: "Antigravity launches Browser Sub-Agent for UI testing", category: "new_tool", relevance_score: 4, summary: "Antigravity now supports a browser sub-agent that can interact with your deployed app for automated UI testing. Could be useful for TravelVax and RxTracker.", date_seen: daysAgo(2), is_bookmarked: false, is_dismissed: false },
  { id: "d2", title: "OpenRouter adds free daily quota for Llama 3.3 70B", category: "promo", relevance_score: 5, summary: "Free daily usage of Llama 3.3 70B on OpenRouter — great for the prompt pipeline experiments.", date_seen: daysAgo(3), is_bookmarked: true, is_dismissed: false },
  { id: "d3", title: "Base44 increases free tier to 500 messages/month", category: "platform_change", relevance_score: 3, summary: "Base44 bumped the free tier. Might be enough to finish the consent form builder without paying.", date_seen: daysAgo(5), is_bookmarked: false, is_dismissed: false },
  { id: "d4", title: "Manus now supports file upload in research workflows", category: "platform_change", relevance_score: 4, summary: "File upload support means I can feed PDFs directly into the research workflow instead of copy-pasting.", date_seen: daysAgo(7), is_bookmarked: false, is_dismissed: false },
  { id: "d5", title: "Best prompts for Lovable schema design (community thread)", category: "tip", relevance_score: 5, summary: "Community thread with tested prompts for getting Lovable to generate clean database schemas. Bookmarked for RxTracker rescue.", date_seen: daysAgo(1), is_bookmarked: true, is_dismissed: false },
];

export const seedCosts = [
  { id: "c1", platform: "Lovable", amount: 28, currency: "AUD", entry_type: "subscription", date: daysAgo(5), account_label: "Primary", project_name: null, notes: "Monthly subscription" },
  { id: "c2", platform: "Base44", amount: 12, currency: "AUD", entry_type: "one_off", date: daysAgo(14), account_label: "Pharmacy", project_name: "Patient Consent Form Builder", notes: "Promo credit top-up" },
  { id: "c3", platform: "Replit", amount: 8, currency: "AUD", entry_type: "subscription", date: daysAgo(3), account_label: "Pharmacy", project_name: null, notes: "Hacker plan" },
];
