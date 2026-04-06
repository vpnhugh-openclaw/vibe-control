import { useMemo, useState } from "react";
import Markdown from "react-markdown";
import { AppShell } from "@/components/layout/AppShell";
import { seedProjects, seedPrompts, type SeedPrompt } from "@/lib/seedData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlatformBadge } from "@/components/PlatformBadge";
import { Search, Plus, Copy, Star, Link2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate, timeAgo } from "@/lib/utils";

const CATEGORIES = ["rescue", "debugging", "ui", "research", "workflow"];
const SORT_OPTIONS = [
  { value: "date_added", label: "Date added" },
  { value: "last_used", label: "Last used" },
  { value: "effectiveness", label: "Effectiveness" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const platformSlugMap: Record<string, string> = {
  Lovable: "lovable",
  Replit: "replit",
  Base44: "base44",
  Manus: "mlflow",
  Bolt: "bolt",
  v0: "vercel",
  Cursor: "cursor",
  "VS Code + Copilot": "visualstudiocode",
  OpenRouter: "openrouter",
};

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<SeedPrompt[]>(seedPrompts);
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortOption>("date_added");
  const [editorOpen, setEditorOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState<SeedPrompt | null>(null);
  const [projectLinkOpen, setProjectLinkOpen] = useState(false);
  const [projectToLink, setProjectToLink] = useState<SeedPrompt | null>(null);

  const allPlatforms = useMemo(() => [...new Set(prompts.flatMap((prompt) => prompt.linked_platforms))], [prompts]);

  const filteredPrompts = useMemo(() => {
    const filtered = prompts.filter((prompt) => {
      const blob = [prompt.title, prompt.prompt_text, prompt.tags.join(" "), prompt.notes].join(" ").toLowerCase();
      if (query && !blob.includes(query.toLowerCase())) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(prompt.category)) return false;
      if (selectedPlatforms.length > 0 && !prompt.linked_platforms.some((platform) => selectedPlatforms.includes(platform))) return false;
      if (prompt.effectiveness_rating < minRating) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "effectiveness") return b.effectiveness_rating - a.effectiveness_rating;
      if (sortBy === "last_used") return new Date(b.last_used_date).getTime() - new Date(a.last_used_date).getTime();
      return new Date(b.date_added).getTime() - new Date(a.date_added).getTime();
    });
  }, [minRating, prompts, query, selectedCategories, selectedPlatforms, sortBy]);

  const openNewPrompt = () => {
    setActivePrompt({
      id: `prompt-${Date.now()}`,
      title: "New Prompt",
      category: "rescue",
      prompt_text: "",
      effectiveness_rating: 3,
      linked_platforms: [],
      linked_project_ids: [],
      tags: [],
      notes: "",
      date_added: new Date().toISOString().slice(0, 10),
      last_used_date: new Date().toISOString().slice(0, 10),
    });
    setEditorOpen(true);
  };

  const savePrompt = (prompt: SeedPrompt) => {
    setPrompts((prev) => {
      const exists = prev.some((item) => item.id === prompt.id);
      return exists ? prev.map((item) => (item.id === prompt.id ? prompt : item)) : [prompt, ...prev];
    });
    setEditorOpen(false);
    toast.success("Prompt saved");
  };

  const copyPrompt = async (prompt: SeedPrompt) => {
    await navigator.clipboard.writeText(prompt.prompt_text);
    toast.success("Copied!");
  };

  return (
    <AppShell title="Prompt Vault">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-body text-muted-foreground">Store your best prompts, rescue prompts, and reusable playbooks.</p>
          </div>
          <Button className="bg-accent-violet text-primary-foreground hover:bg-accent-violet/90" onClick={openNewPrompt}>
            <Plus className="mr-1.5 h-4 w-4" />Add Prompt
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 card-shadow space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search title, prompt text, tags, notes..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_1.2fr_0.8fr_0.8fr]">
            <FilterPills label="Category" options={CATEGORIES} selected={selectedCategories} onToggle={(value) => setSelectedCategories((prev) => prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value])} />
            <FilterPills label="Platform" options={allPlatforms} selected={selectedPlatforms} onToggle={(value) => setSelectedPlatforms((prev) => prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value])} />
            <div>
              <p className="mb-1.5 text-label text-muted-foreground">Minimum effectiveness</p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button key={rating} onClick={() => setMinRating(rating)} className={`rounded-pill px-3 py-1 text-label ${minRating === rating ? "bg-accent-amber text-foreground" : "bg-muted text-muted-foreground"}`}>
                    {rating}+
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-label text-muted-foreground">Sort by</p>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredPrompts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
            <p className="text-body text-foreground">No prompts yet.</p>
            <p className="mt-1 text-body text-muted-foreground">Save your first working prompt from a stall diagnosis and it’ll show up here.</p>
            <Button className="mt-4 bg-accent-violet text-primary-foreground hover:bg-accent-violet/90" onClick={openNewPrompt}>Add your first prompt</Button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
            {filteredPrompts.map((prompt) => {
              const linkedProjects = seedProjects.filter((project) => prompt.linked_project_ids.includes(project.id));
              return (
                <div key={prompt.id} className="rounded-xl border border-border bg-card p-5 card-shadow space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-[15px] font-semibold text-foreground">{prompt.title}</h2>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-pill bg-muted px-2 py-0.5 text-label capitalize text-muted-foreground">{prompt.category}</span>
                        <Stars value={prompt.effectiveness_rating} />
                      </div>
                    </div>
                    <div className="text-right text-label text-muted-foreground">
                      <p>Added {formatDate(prompt.date_added)}</p>
                      <p className="tabular-nums">Used {timeAgo(prompt.last_used_date)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {prompt.linked_platforms.map((platform) => (
                      <PlatformBadge key={platform} name={platform} logoSlug={platformSlugMap[platform]} />
                    ))}
                    <span className="rounded-pill bg-accent-cyan/10 px-2 py-0.5 text-label text-accent-cyan">Used in {linkedProjects.length} project{linkedProjects.length !== 1 ? "s" : ""}</span>
                  </div>

                  <div className="relative overflow-hidden rounded-lg border border-border bg-card p-4 font-mono text-sm" style={{ borderLeftWidth: 2, borderLeftColor: "hsl(var(--accent-violet))" }}>
                    <button onClick={() => copyPrompt(prompt)} className="absolute right-3 top-3 rounded-md border border-border bg-background px-2 py-1 text-label text-muted-foreground hover:text-foreground">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <div className="prose prose-invert max-w-none text-sm">
                      <Markdown>{prompt.prompt_text}</Markdown>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-label text-muted-foreground">
                    {prompt.tags.map((tag) => <span key={tag} className="rounded-pill bg-muted px-2 py-0.5">#{tag}</span>)}
                  </div>

                  <p className="text-body text-muted-foreground">{prompt.notes}</p>

                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => copyPrompt(prompt)}><Copy className="mr-1.5 h-4 w-4" />Copy</Button>
                    <Button variant="outline" onClick={() => { setProjectToLink(prompt); setProjectLinkOpen(true); }}><Link2 className="mr-1.5 h-4 w-4" />Use on Project</Button>
                    <Button className="bg-accent-violet text-primary-foreground hover:bg-accent-violet/90" onClick={() => { setActivePrompt(prompt); setEditorOpen(true); }}>Edit Prompt</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PromptEditorSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        prompt={activePrompt}
        onSave={savePrompt}
      />

      <ProjectLinkSheet
        open={projectLinkOpen}
        onOpenChange={setProjectLinkOpen}
        prompt={projectToLink}
        projects={seedProjects}
      />
    </AppShell>
  );
}

function FilterPills({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-label text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button key={option} onClick={() => onToggle(option)} className={`rounded-pill px-2.5 py-1 text-label capitalize ${selected.includes(option) ? "bg-accent-violet text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={`h-3.5 w-3.5 ${index < value ? "fill-accent-amber text-accent-amber" : "text-muted-foreground"}`} />
      ))}
    </div>
  );
}

function PromptEditorSheet({ open, onOpenChange, prompt, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; prompt: SeedPrompt | null; onSave: (prompt: SeedPrompt) => void }) {
  const [draft, setDraft] = useState<SeedPrompt | null>(null);

  const resolved = draft ?? prompt;

  const handleOpen = (next: boolean) => {
    if (next && prompt) setDraft({ ...prompt });
    if (!next) {
      setDraft(null);
      onOpenChange(false);
    }
  };

  if (!resolved) return null;

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="right" className="overflow-y-auto p-0 sm:max-w-[600px]">
        <div className="border-b border-border p-6">
          <SheetHeader>
            <SheetTitle>{resolved.title}</SheetTitle>
            <SheetDescription>Create or refine a reusable prompt.</SheetDescription>
          </SheetHeader>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <p className="mb-1.5 text-label text-muted-foreground">Title</p>
            <Input value={resolved.title} onChange={(e) => setDraft({ ...resolved, title: e.target.value })} />
          </div>
          <div>
            <p className="mb-1.5 text-label text-muted-foreground">Category</p>
            <Select value={resolved.category} onValueChange={(value) => setDraft({ ...resolved, category: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <p className="mb-1.5 text-label text-muted-foreground">Prompt text</p>
            <textarea className="min-h-[220px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={resolved.prompt_text} onChange={(e) => setDraft({ ...resolved, prompt_text: e.target.value })} />
          </div>
          <div>
            <p className="mb-1.5 text-label text-muted-foreground">Effectiveness</p>
            <div className="flex gap-1.5">{[1, 2, 3, 4, 5].map((value) => <button key={value} onClick={() => setDraft({ ...resolved, effectiveness_rating: value })} className={`rounded-pill px-3 py-1 text-label ${resolved.effectiveness_rating === value ? "bg-accent-amber text-foreground" : "bg-muted text-muted-foreground"}`}>{value}</button>)}</div>
          </div>
          <div>
            <p className="mb-1.5 text-label text-muted-foreground">Platforms (comma-separated)</p>
            <Input value={resolved.linked_platforms.join(", ")} onChange={(e) => setDraft({ ...resolved, linked_platforms: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
          </div>
          <div>
            <p className="mb-1.5 text-label text-muted-foreground">Tags (comma-separated)</p>
            <Input value={resolved.tags.join(", ")} onChange={(e) => setDraft({ ...resolved, tags: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
          </div>
          <div>
            <p className="mb-1.5 text-label text-muted-foreground">Notes</p>
            <textarea className="min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={resolved.notes} onChange={(e) => setDraft({ ...resolved, notes: e.target.value })} />
          </div>
          <Button className="w-full bg-accent-violet text-primary-foreground hover:bg-accent-violet/90" onClick={() => resolved && onSave(resolved)}>Save Prompt</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ProjectLinkSheet({ open, onOpenChange, prompt, projects }: { open: boolean; onOpenChange: (open: boolean) => void; prompt: SeedPrompt | null; projects: typeof seedProjects }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto p-0 sm:max-w-[520px]">
        <div className="border-b border-border p-6">
          <SheetHeader>
            <SheetTitle>Use on Project</SheetTitle>
            <SheetDescription>{prompt ? `Choose where to use “${prompt.title}”.` : "Choose a project."}</SheetDescription>
          </SheetHeader>
        </div>
        <div className="space-y-3 p-6">
          {projects.map((project) => (
            <div key={project.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{project.name}</p>
                  <p className="text-body text-muted-foreground">{project.next_action || project.short_description}</p>
                </div>
                <Button variant="outline" onClick={() => toast.success(`Linked prompt to ${project.name} (mock flow)`)}>Link</Button>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
