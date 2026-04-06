import { useMemo, useState } from "react";
import { SeedProject, type SeedUpdate } from "@/lib/seedData";
import { mockAI, type StallAssessmentResult } from "@/lib/mockAI";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { RescueScoreArc } from "@/components/RescueScoreArc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { timeAgo, cn } from "@/lib/utils";
import { Save, Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["idea", "planning", "building", "testing", "launched", "paused", "stalled", "abandoned"];
const PROJECT_TYPES = ["web_app", "mobile_app", "automation", "website_revamp", "scraping_tool", "api_integration", "pharmacy_business", "research_workflow", "other"];
const ACCOUNTS = ["Primary", "Pharmacy", "Alt Dev"];
const SCORE_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const DIAGNOSIS_STEPS = [1, 2, 3, 4, 5] as const;

const DIAGNOSIS_FIELDS = [
  { key: "scope_clarity", label: "Scope Clarity", hint: "1 = totally vague, 5 = crystal clear" },
  { key: "technical_blockers", label: "Technical Blockers", hint: "1 = completely stuck, 5 = no blockers" },
  { key: "prompt_quality", label: "Prompt Quality", hint: "1 = giving the AI bad instructions, 5 = prompting well" },
  { key: "motivation_energy", label: "Motivation & Energy", hint: "1 = dread opening this, 5 = can't wait to work on it" },
  { key: "monetisation_clarity", label: "Monetisation Clarity", hint: "1 = no idea who would pay, 5 = clear business case" },
  { key: "credits_account", label: "Credits & Account", hint: "1 = blocked by credits or wrong account, 5 = no issue" },
  { key: "platform_fit", label: "Platform Fit", hint: "1 = wrong tool for this job, 5 = perfect platform choice" },
] as const;

type DiagnosisKey = (typeof DIAGNOSIS_FIELDS)[number]["key"];

type DiagnosisForm = Record<DiagnosisKey, number> & {
  last_progress: string;
  blocked_now: string;
  tried_already: string;
  unclear_now: string;
  wrong_account_platform: string;
  needs_scope_narrowing: boolean;
};

interface ProjectDrawerProps {
  project: SeedProject | null;
  open: boolean;
  onClose: () => void;
  onSave: (project: SeedProject) => void;
  onAddNote: (projectId: string, content: string, type?: string) => void;
  updates: SeedUpdate[];
  isNew?: boolean;
}

const defaultDiagnosis = (): DiagnosisForm => ({
  scope_clarity: 3,
  technical_blockers: 3,
  prompt_quality: 3,
  motivation_energy: 3,
  monetisation_clarity: 3,
  credits_account: 3,
  platform_fit: 3,
  last_progress: "",
  blocked_now: "",
  tried_already: "",
  unclear_now: "",
  wrong_account_platform: "",
  needs_scope_narrowing: false,
});

export function ProjectDrawer({ project, open, onClose, onSave, onAddNote, updates, isNew }: ProjectDrawerProps) {
  const [form, setForm] = useState<SeedProject | null>(null);
  const [newNote, setNewNote] = useState("");
  const [diagnosis, setDiagnosis] = useState<DiagnosisForm>(defaultDiagnosis());
  const [assessment, setAssessment] = useState<StallAssessmentResult | null>(null);
  const [isRunningAssessment, setIsRunningAssessment] = useState(false);

  const p = form ?? project;

  const sortedUpdates = useMemo(() => [...updates].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [updates]);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && project) {
      setForm({ ...project });
      setDiagnosis(defaultDiagnosis());
      setAssessment(null);
    } else if (!isOpen) {
      setForm(null);
      setNewNote("");
      setDiagnosis(defaultDiagnosis());
      setAssessment(null);
      onClose();
    }
  };

  const updateField = <K extends keyof SeedProject>(key: K, value: SeedProject[K]) => {
    if (!p) return;
    setForm({ ...p, [key]: value });
  };

  const handleSave = () => {
    if (!p) return;
    onSave(p);
    onClose();
  };

  const handleAddNote = () => {
    if (!p || !newNote.trim()) return;
    onAddNote(p.id, newNote.trim(), "note");
    setNewNote("");
  };

  const runAssessment = async () => {
    setIsRunningAssessment(true);
    try {
      const result = await mockAI("stall_assessment") as StallAssessmentResult;
      setAssessment(result);
    } finally {
      setIsRunningAssessment(false);
    }
  };

  const saveAssessmentToLog = () => {
    if (!p || !assessment) return;
    onAddNote(p.id, JSON.stringify(assessment), "assessment");
  };

  if (!p) return null;

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="right" className="flex h-full flex-col overflow-y-auto p-0 sm:max-w-[600px]">
        <div className="border-b border-border p-6 pb-4">
          <SheetHeader>
            <div className="flex items-center gap-3 pr-8">
              <button
                className="flex-1 truncate text-left text-page-title font-semibold text-foreground"
                onClick={() => {}}
              >
                {p.name}
              </button>
              <button onClick={() => updateField("status", STATUSES[(STATUSES.indexOf(p.status) + 1) % STATUSES.length])}>
                <StatusBadge status={p.status} />
              </button>
            </div>
            <SheetDescription className="text-body text-muted-foreground">{p.short_description || "Add a short description to summarise the project."}</SheetDescription>
          </SheetHeader>
        </div>

        <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-border px-6 py-3">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
              <TabsTrigger value="diagnosis">Stall Diagnosis</TabsTrigger>
              <TabsTrigger value="prompts">Linked Prompts</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-5 px-6 pb-6 pt-5">
            <FieldGroup>
              <FieldLabel>Project Name</FieldLabel>
              <Input value={p.name} onChange={(e) => updateField("name", e.target.value)} />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Short Description</FieldLabel>
              <Textarea rows={2} value={p.short_description} onChange={(e) => updateField("short_description", e.target.value)} />
            </FieldGroup>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup>
                <FieldLabel>Status</FieldLabel>
                <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-body" value={p.status} onChange={(e) => updateField("status", e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>Project Type</FieldLabel>
                <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-body" value={p.project_type} onChange={(e) => updateField("project_type", e.target.value)}>
                  {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </FieldGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup>
                <FieldLabel>Platform</FieldLabel>
                <Input value={p.platform_name} onChange={(e) => updateField("platform_name", e.target.value)} />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>Account</FieldLabel>
                <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-body" value={p.account_label} onChange={(e) => updateField("account_label", e.target.value)}>
                  {ACCOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </FieldGroup>
            </div>

            <FieldGroup>
              <FieldLabel>Next Action</FieldLabel>
              <Input value={p.next_action || ""} onChange={(e) => updateField("next_action", e.target.value || null)} placeholder="What should happen next?" />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Blocker Summary</FieldLabel>
              <Textarea rows={3} value={p.blocker_summary || ""} onChange={(e) => updateField("blocker_summary", e.target.value || null)} placeholder="What is in the way right now?" />
            </FieldGroup>

            <div className="space-y-3">
              <FieldLabel>Assessment Scores</FieldLabel>
              <ScoreRow label="Confidence" value={p.confidence_score} onChange={(v) => updateField("confidence_score", v)} />
              <ScoreRow label="Motivation" value={p.motivation_score} onChange={(v) => updateField("motivation_score", v)} />
              <ScoreRow label="Monetisation" value={p.monetisation_score} onChange={(v) => updateField("monetisation_score", v)} />
              <ScoreRow label="Platform Fit" value={p.platform_fit_score} onChange={(v) => updateField("platform_fit_score", v)} />
              <ScoreRow label="Effort to Unblock" value={p.effort_score} onChange={(v) => updateField("effort_score", v)} inverted />
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-body font-medium">Rescue Score</span>
                <RescueScoreArc score={p.rescue_score} size={54} />
              </div>
            </div>

            <FieldGroup>
              <FieldLabel>Attachment Upload</FieldLabel>
              <button className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-4 text-body text-muted-foreground transition-colors hover:bg-muted/50">
                <Paperclip className="h-4 w-4" />
                Upload attachment to Supabase storage
              </button>
            </FieldGroup>

            <div className="border-t border-border pt-4">
              <Button onClick={handleSave} className="w-full rounded-md bg-accent-violet text-primary-foreground hover:bg-accent-violet/90">
                <Save className="mr-2 h-4 w-4" />
                {isNew ? "Create Project" : "Save Changes"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 px-6 pb-6 pt-5">
            <div className="rounded-lg border border-border p-4">
              <Textarea rows={3} placeholder="Add Note" value={newNote} onChange={(e) => setNewNote(e.target.value)} />
              <Button onClick={handleAddNote} disabled={!newNote.trim()} className="mt-3 rounded-md bg-accent-violet text-primary-foreground hover:bg-accent-violet/90">
                Add Note
              </Button>
            </div>

            {sortedUpdates.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-body text-muted-foreground">
                No activity yet. Add the first note so this project has a proper trail.
              </div>
            ) : (
              <div className="space-y-3">
                {sortedUpdates.map((u) => (
                  <div key={u.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
                    <span className="shrink-0 rounded-pill bg-accent-violet/10 px-2 py-0.5 text-label capitalize text-accent-violet">
                      {u.type.replace(/_/g, " ")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-body text-foreground break-words">{u.content}</p>
                      <p className="mt-1 text-label text-muted-foreground tabular-nums">{timeAgo(u.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="diagnosis" className="space-y-5 px-6 pb-6 pt-5">
            <div className="space-y-4 rounded-lg border border-border p-4">
              {DIAGNOSIS_FIELDS.map((field) => (
                <DiagnosisRow
                  key={field.key}
                  label={field.label}
                  hint={field.hint}
                  value={diagnosis[field.key]}
                  onChange={(value) => setDiagnosis((prev) => ({ ...prev, [field.key]: value }))}
                />
              ))}

              <DiagnosisText label="What was the last meaningful progress made?" value={diagnosis.last_progress} onChange={(value) => setDiagnosis((prev) => ({ ...prev, last_progress: value }))} />
              <DiagnosisText label="What is currently blocked?" value={diagnosis.blocked_now} onChange={(value) => setDiagnosis((prev) => ({ ...prev, blocked_now: value }))} />
              <DiagnosisText label="What has already been tried?" value={diagnosis.tried_already} onChange={(value) => setDiagnosis((prev) => ({ ...prev, tried_already: value }))} />
              <DiagnosisText label="What still feels unclear or ambiguous?" value={diagnosis.unclear_now} onChange={(value) => setDiagnosis((prev) => ({ ...prev, unclear_now: value }))} />
              <DiagnosisText label="Is this stuck because of credits, the wrong account, or the wrong platform?" value={diagnosis.wrong_account_platform} onChange={(value) => setDiagnosis((prev) => ({ ...prev, wrong_account_platform: value }))} />

              <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2">
                <div>
                  <p className="text-body text-foreground">This project probably needs to be narrowed in scope.</p>
                </div>
                <Switch checked={diagnosis.needs_scope_narrowing} onCheckedChange={(checked) => setDiagnosis((prev) => ({ ...prev, needs_scope_narrowing: checked }))} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={runAssessment} className="rounded-md bg-accent-violet text-primary-foreground hover:bg-accent-violet/90" disabled={isRunningAssessment}>
                {isRunningAssessment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Run AI Stall Assessment
              </Button>
              <Button variant="outline" disabled={!assessment} onClick={() => assessment && toast.success("Fix prompt ready for Prompt Vault prefill flow")}>Save Fix Prompt to Vault</Button>
              <Button variant="outline" disabled={!assessment} onClick={saveAssessmentToLog}>Save Assessment to Project Log</Button>
            </div>

            <div className="rounded-lg border border-border p-4 min-h-[240px]">
              {isRunningAssessment && (
                <div className="flex h-full min-h-[200px] items-center justify-center text-body text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running structured stall assessment...
                </div>
              )}

              {!isRunningAssessment && !assessment && (
                <div className="flex min-h-[200px] items-center justify-center text-center text-body text-muted-foreground">
                  Run the AI assessment to generate likely stall causes, a recovery plan, and the smallest next step.
                </div>
              )}

              {!isRunningAssessment && assessment && (
                <div className="space-y-5">
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                      <h3 className="font-semibold text-foreground">Stall causes</h3>
                      <div className="mt-3 space-y-3">
                        {assessment.stall_causes.map((cause) => (
                          <div key={cause.cause} className="rounded-lg border border-border p-3">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "rounded-pill px-2 py-0.5 text-label capitalize",
                                cause.probability === "high" && "bg-accent-red/15 text-accent-red",
                                cause.probability === "medium" && "bg-accent-amber/15 text-accent-amber",
                                cause.probability === "low" && "bg-muted text-muted-foreground"
                              )}>{cause.probability}</span>
                              <span className="font-semibold text-foreground">{cause.cause}</span>
                            </div>
                            <p className="mt-2 text-body text-secondary-foreground/80">{cause.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 rounded-lg border border-border p-4">
                      <div className={cn(
                        "rounded-full px-4 py-2 text-center text-body font-semibold capitalize",
                        assessment.recommendation === "salvage" && "bg-accent-green/15 text-accent-green",
                        ["pause", "restart"].includes(assessment.recommendation) && "bg-accent-amber/15 text-accent-amber",
                        assessment.recommendation === "abandon" && "bg-accent-red/15 text-accent-red"
                      )}>
                        Recommendation: {assessment.recommendation}
                      </div>
                      <div className="flex justify-center"><RescueScoreArc score={assessment.rescue_score} size={120} /></div>
                      <div className="grid grid-cols-2 gap-2">
                        <FlagPill label="Switch platform" active={assessment.switch_platform} />
                        <FlagPill label="Switch account" active={assessment.switch_account} />
                        <FlagPill label="Reduce scope" active={assessment.reduce_scope} />
                        <FlagPill label="Prompting main issue" active={assessment.prompting_is_main_issue} />
                        <FlagPill label="Technical debt main issue" active={assessment.technical_debt_is_main_issue} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground">Recovery plan</h3>
                    <ol className="mt-3 space-y-2 pl-5 text-body text-foreground list-decimal">
                      {assessment.recovery_plan.map((step) => <li key={step}>{step}</li>)}
                    </ol>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4" style={{ borderLeftWidth: 4, borderLeftColor: "hsl(var(--accent-cyan))" }}>
                    <p className="text-label uppercase tracking-wide text-muted-foreground">Smallest next step</p>
                    <p className="mt-2 text-body text-foreground">{assessment.smallest_next_step}</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-4 px-6 pb-6 pt-5">
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <p className="text-body text-foreground">No prompts linked to this project yet.</p>
              <p className="mt-1 text-body text-muted-foreground">Link an existing prompt or create a new rescue prompt from the diagnosis results.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Button variant="outline">Link Prompt</Button>
                <Button className="bg-accent-violet text-primary-foreground hover:bg-accent-violet/90">Create New Prompt</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-label text-muted-foreground">{children}</label>;
}

function ScoreRow({ label, value, onChange, inverted = false }: { label: string; value: number; onChange: (v: number) => void; inverted?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-body">{label}</span>
      <div className="flex flex-1 gap-0.5">
        {SCORE_STEPS.map((step) => {
          const isActive = step <= value;
          const getColor = () => {
            if (inverted) {
              if (step <= 3) return "bg-accent-green";
              if (step <= 6) return "bg-accent-amber";
              return "bg-accent-red";
            }
            if (step <= 3) return "bg-accent-red";
            if (step <= 6) return "bg-accent-amber";
            return "bg-accent-green";
          };
          return (
            <button key={step} onClick={() => onChange(step)} className={`h-6 flex-1 rounded-sm transition-colors duration-150 ${isActive ? getColor() : "bg-muted"}`} />
          );
        })}
      </div>
      <span className="w-6 text-right text-label font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function DiagnosisRow({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (value: number) => void }) {
  const colors = ["#f87171", "#fb923c", "#f59e0b", "#86efac", "#4ade80"];
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-body font-medium text-foreground">{label}</p>
          <p className="text-label text-muted-foreground">{hint}</p>
        </div>
        <span className="text-body font-semibold tabular-nums">{value}</span>
      </div>
      <div className="flex gap-2">
        {DIAGNOSIS_STEPS.map((step, index) => (
          <button
            key={step}
            onClick={() => onChange(step)}
            className={cn("flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-opacity", value === step ? "text-white opacity-100" : "text-foreground opacity-70")}
            style={{ backgroundColor: colors[index] }}
          >
            {step}
          </button>
        ))}
      </div>
    </div>
  );
}

function DiagnosisText({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <FieldGroup>
      <FieldLabel>{label}</FieldLabel>
      <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
    </FieldGroup>
  );
}

function FlagPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={cn("rounded-pill px-2 py-1 text-center text-label", active ? "bg-accent-violet text-primary-foreground" : "bg-muted text-muted-foreground")}>
      {label}
    </span>
  );
}
