import { useState } from "react";
import { SeedProject, seedUpdates } from "@/lib/seedData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { PlatformBadge } from "@/components/PlatformBadge";
import { AccountBadge } from "@/components/AccountBadge";
import { RescueScoreArc } from "@/components/RescueScoreArc";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import { Save, ExternalLink, ChevronDown } from "lucide-react";

const STATUSES = ["idea", "planning", "building", "testing", "launched", "paused", "stalled", "abandoned"];
const PROJECT_TYPES = ["web_app", "mobile_app", "automation", "website_revamp", "scraping_tool", "api_integration", "pharmacy_business", "research_workflow", "other"];
const ACCOUNTS = ["Primary", "Pharmacy", "Alt Dev"];
const SCORE_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface ProjectDrawerProps {
  project: SeedProject | null;
  open: boolean;
  onClose: () => void;
  onSave: (project: SeedProject) => void;
  isNew?: boolean;
}

export function ProjectDrawer({ project, open, onClose, onSave, isNew }: ProjectDrawerProps) {
  const [form, setForm] = useState<SeedProject | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newNote, setNewNote] = useState("");

  // Sync form when project changes
  const p = form ?? project;

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && project) {
      setForm({ ...project });
    } else if (!isOpen) {
      setForm(null);
      setShowAdvanced(false);
      setNewNote("");
      onClose();
    }
  };

  const updateField = <K extends keyof SeedProject>(key: K, value: SeedProject[K]) => {
    if (p) setForm({ ...p, [key]: value });
  };

  const handleSave = () => {
    if (p) {
      onSave(p);
      onClose();
    }
  };

  const projectUpdates = seedUpdates.filter((u) => u.project_name === p?.name);

  if (!p) return null;

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="right" className="overflow-y-auto p-0 flex flex-col">
        {/* Header */}
        <div className="p-6 pb-0">
          <SheetHeader>
            <div className="flex items-center gap-3 pr-8">
              <SheetTitle className="text-page-title flex-1 truncate">{p.name}</SheetTitle>
              <StatusBadge status={p.status} />
            </div>
            <SheetDescription className="text-body text-muted-foreground">
              {p.short_description}
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="flex-1 flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">Activity Log</TabsTrigger>
              <TabsTrigger value="diagnosis" className="flex-1">Diagnosis</TabsTrigger>
              <TabsTrigger value="prompts" className="flex-1">Prompts</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1 px-6 pb-6 space-y-5">
            {/* Core fields */}
            <FieldGroup>
              <FieldLabel>Project Name</FieldLabel>
              <input
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-body"
                value={p.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Short Description</FieldLabel>
              <textarea
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-body resize-none"
                rows={2}
                value={p.short_description}
                onChange={(e) => updateField("short_description", e.target.value)}
              />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <FieldLabel>Status</FieldLabel>
                <select
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-body"
                  value={p.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Project Type</FieldLabel>
                <select
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-body"
                  value={p.project_type}
                  onChange={(e) => updateField("project_type", e.target.value)}
                >
                  {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </FieldGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <FieldLabel>Platform</FieldLabel>
                <input
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-body"
                  value={p.platform_name}
                  onChange={(e) => updateField("platform_name", e.target.value)}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Account</FieldLabel>
                <select
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-body"
                  value={p.account_label}
                  onChange={(e) => updateField("account_label", e.target.value)}
                >
                  {ACCOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </FieldGroup>
            </div>

            <FieldGroup>
              <FieldLabel>Next Action</FieldLabel>
              <input
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-body"
                value={p.next_action || ""}
                onChange={(e) => updateField("next_action", e.target.value || null)}
                placeholder="What's the next step?"
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Blocker Summary</FieldLabel>
              <textarea
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-body resize-none"
                rows={3}
                value={p.blocker_summary || ""}
                onChange={(e) => updateField("blocker_summary", e.target.value || null)}
                placeholder="What's blocking progress?"
              />
            </FieldGroup>

            {/* Score inputs */}
            <div className="space-y-3">
              <FieldLabel>Assessment Scores</FieldLabel>
              <ScoreRow label="Confidence" value={p.confidence_score} onChange={(v) => updateField("confidence_score", v)} />
              <ScoreRow label="Motivation" value={p.motivation_score} onChange={(v) => updateField("motivation_score", v)} />
              <ScoreRow label="Monetisation" value={p.monetisation_score} onChange={(v) => updateField("monetisation_score", v)} />
              <ScoreRow label="Platform Fit" value={p.platform_fit_score} onChange={(v) => updateField("platform_fit_score", v)} />
              <ScoreRow label="Effort" value={p.effort_score} onChange={(v) => updateField("effort_score", v)} />

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-body font-medium">Rescue Score</span>
                <RescueScoreArc score={p.rescue_score} size={48} />
              </div>
            </div>

            {/* Advanced fields */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-label text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              Advanced
            </button>

            {showAdvanced && (
              <div className="space-y-4 pl-2 border-l-2 border-border">
                <FieldGroup>
                  <FieldLabel>Priority (1–5)</FieldLabel>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    className="w-20 bg-background border border-border rounded-md px-3 py-2 text-body tabular-nums"
                    value={p.priority}
                    onChange={(e) => updateField("priority", Number(e.target.value))}
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Last Active Date</FieldLabel>
                  <input
                    type="date"
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-body"
                    value={p.last_active_date}
                    onChange={(e) => updateField("last_active_date", e.target.value)}
                  />
                </FieldGroup>
              </div>
            )}

            {/* Save */}
            <div className="pt-4 border-t border-border">
              <Button onClick={handleSave} className="w-full bg-accent-violet hover:bg-accent-violet/90 text-primary-foreground rounded-md">
                <Save className="h-4 w-4 mr-2" />
                {isNew ? "Create Project" : "Save Changes"}
              </Button>
            </div>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="flex-1 px-6 pb-6">
            <div className="mb-4">
              <textarea
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-body resize-none"
                rows={2}
                placeholder="Add a note…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <Button
                onClick={() => { setNewNote(""); }}
                disabled={!newNote.trim()}
                className="mt-2 bg-accent-violet hover:bg-accent-violet/90 text-primary-foreground rounded-md"
                size="sm"
              >
                Add Note
              </Button>
            </div>

            {projectUpdates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-body">No activity yet. Add a note to start tracking progress.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projectUpdates.map((u) => (
                  <div key={u.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                    <span className="text-label text-accent-violet font-medium shrink-0 capitalize rounded-pill bg-accent-violet/10 px-2 py-0.5">
                      {u.type.replace("_", " ")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-body">{u.content}</p>
                      <p className="text-label text-muted-foreground mt-1 tabular-nums">{timeAgo(u.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Diagnosis Tab */}
          <TabsContent value="diagnosis" className="flex-1 px-6 pb-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground text-body mb-4">Run a stall diagnosis to identify what's blocking this project and get an AI-generated recovery plan.</p>
              <Button className="bg-accent-violet hover:bg-accent-violet/90 text-primary-foreground rounded-md">
                Run AI Stall Assessment
              </Button>
            </div>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts" className="flex-1 px-6 pb-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground text-body mb-4">No prompts linked to this project yet.</p>
              <Button variant="outline" className="rounded-md">
                Link a Prompt
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-label text-muted-foreground block">{children}</label>;
}

function ScoreRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-body w-28 shrink-0">{label}</span>
      <div className="flex gap-0.5 flex-1">
        {SCORE_STEPS.map((step) => {
          const isActive = step <= value;
          const getColor = () => {
            if (label === "Effort") {
              // Inverted: high effort = bad
              if (step <= 3) return "bg-accent-green";
              if (step <= 6) return "bg-accent-amber";
              return "bg-accent-red";
            }
            if (step <= 3) return "bg-accent-red";
            if (step <= 6) return "bg-accent-amber";
            return "bg-accent-green";
          };
          return (
            <button
              key={step}
              onClick={() => onChange(step)}
              className={`h-6 flex-1 rounded-sm transition-colors duration-150 ${isActive ? getColor() : "bg-muted"}`}
              title={`${step}`}
            />
          );
        })}
      </div>
      <span className="text-label tabular-nums font-semibold w-6 text-right">{value}</span>
    </div>
  );
}
