import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { type SeedProject, type SeedUpdate } from "@/lib/seedData";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectTable } from "@/components/projects/ProjectTable";
import { ProjectFiltersPanel, type ProjectFilters, DEFAULT_FILTERS } from "@/components/projects/ProjectFiltersPanel";
import { ProjectDrawer } from "@/components/projects/ProjectDrawer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, List, LifeBuoy, CalendarDays, Plus, Archive, Tag, UserCog, X } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import { useProjects, usePrompts, useUpdates } from "@/hooks/useAppData";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { toast } from "sonner";

type ViewMode = "card" | "table" | "rescue" | "heatmap";

const STATUS_OPTIONS = ["idea", "planning", "building", "testing", "launched", "paused", "stalled", "abandoned"];
const ACCOUNT_OPTIONS = ["Primary", "Ops", "Alt Dev"];
const TAG_OPTIONS = ["urgent", "rescue", "pharmacy", "internal", "ai", "credits", "client"];

function getProjectTags(project: SeedProject): string[] {
  const tags: string[] = [];
  if (["stalled", "paused"].includes(project.status)) tags.push("rescue");
  if (project.priority <= 2) tags.push("urgent");
  if (project.project_type.includes("pharmacy") || project.name.toLowerCase().includes("pharma") || project.name.toLowerCase().includes("rx")) tags.push("pharmacy");
  if (["Lovable", "Cursor", "VS Code + Copilot"].includes(project.platform_name)) tags.push("ai");
  if (project.account_label === "Ops") tags.push("client");
  if (project.name.toLowerCase().includes("internal") || project.name.toLowerCase().includes("staff")) tags.push("internal");
  if ((project.blocker_summary || "").toLowerCase().includes("credit")) tags.push("credits");
  return [...new Set(tags)];
}

function buildProjectUpdatesMap(projects: SeedProject[], updates: SeedUpdate[]) {
  return projects.reduce<Record<string, SeedUpdate[]>>((acc, project) => {
    acc[project.id] = updates.filter((u) => u.project_name === project.name);
    return acc;
  }, {});
}

export default function ProjectsPage() {
  const [view, setView] = useState<ViewMode>("card");
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_FILTERS);
  const [projects, setProjects] = useProjects();
  const [updates, setUpdates] = useUpdates();
  const [prompts, setPrompts] = usePrompts();
  const [drawerProject, setDrawerProject] = useState<SeedProject | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [bulkAccount, setBulkAccount] = useState<string>("");
  const [bulkTag, setBulkTag] = useState<string>("");
  const [heatmapDate, setHeatmapDate] = useState<string | null>(null);

  const projectUpdates = useMemo(() => buildProjectUpdatesMap(projects, updates), [projects, updates]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const tags = getProjectTags(p);
      const searchBlob = [p.name, p.short_description, p.blocker_summary, p.next_action, ...tags]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (filters.query && !searchBlob.includes(filters.query.toLowerCase())) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(p.status)) return false;
      if (filters.types.length > 0 && !filters.types.includes(p.project_type)) return false;
      if (filters.platforms.length > 0 && !filters.platforms.includes(p.platform_name)) return false;
      if (filters.accounts.length > 0 && !filters.accounts.includes(p.account_label)) return false;
      if (filters.tags.length > 0 && !filters.tags.some((tag) => tags.includes(tag))) return false;
      if (filters.stalledOnly && !p.is_stalled) return false;
      if (p.priority < filters.priorityRange[0] || p.priority > filters.priorityRange[1]) return false;
      if (filters.updatedWithinDays > 0) {
        const cutoff = Date.now() - filters.updatedWithinDays * 86400000;
        if (new Date(p.last_active_date).getTime() < cutoff) return false;
      }
      if (p.rescue_score < filters.rescueScoreRange[0] || p.rescue_score > filters.rescueScoreRange[1]) return false;
      return true;
    });
  }, [projects, filters]);

  const rescueProjects = useMemo(
    () => filtered
      .filter((p) => ["stalled", "paused"].includes(p.status))
      .sort((a, b) => b.rescue_score - a.rescue_score),
    [filtered]
  );

  const heatmapValues = useMemo(() => {
    const counts = updates.reduce<Record<string, number>>((acc, update) => {
      const date = update.created_at.slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }, [updates]);

  const heatmapGroupedUpdates = useMemo(() => {
    if (!heatmapDate) return [];
    const sameDay = updates.filter((u) => u.created_at.slice(0, 10) === heatmapDate);
    const grouped = sameDay.reduce<Record<string, SeedUpdate[]>>((acc, update) => {
      acc[update.project_name] = [...(acc[update.project_name] || []), update];
      return acc;
    }, {});
    return Object.entries(grouped);
  }, [heatmapDate, updates]);

  const openProject = (project: SeedProject) => {
    setDrawerProject(project);
    setDrawerOpen(true);
  };

  const handleSave = (updated: SeedProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProject = (projectToDelete: SeedProject) => {
    setProjects((prev) => prev.filter((project) => project.id !== projectToDelete.id));
    setUpdates((prev) => prev.filter((update) => update.project_name !== projectToDelete.name));
    setPrompts((prev) =>
      prev.map((prompt) => ({
        ...prompt,
        linked_project_ids: prompt.linked_project_ids.filter((projectId) => projectId !== projectToDelete.id),
      }))
    );
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(projectToDelete.id);
      return next;
    });
    setDrawerProject((current) => (current?.id === projectToDelete.id ? null : current));
    setDrawerOpen(false);
    toast.success(`Deleted ${projectToDelete.name}`);
  };

  const handleAddNote = (projectId: string, content: string, type: string = "note") => {
    const project = projects.find((p) => p.id === projectId);
    if (!project || !content.trim()) return;

    setUpdates((prev) => [
      {
        id: `u-${Date.now()}`,
        project_name: project.name,
        type,
        content,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(filtered.map((p) => p.id)) : new Set());
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setBulkStatus("");
    setBulkAccount("");
    setBulkTag("");
  };

  const applyBulkStatus = () => {
    if (!bulkStatus) return;
    setProjects((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, status: bulkStatus } : p)));
    clearSelection();
  };

  const applyBulkAccount = () => {
    if (!bulkAccount) return;
    setProjects((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, account_label: bulkAccount } : p)));
    clearSelection();
  };

  const applyBulkTag = () => {
    if (!bulkTag) return;
    clearSelection();
  };

  const archiveSelected = () => {
    setProjects((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, status: "abandoned" } : p)));
    clearSelection();
  };

  const deleteSelected = () => {
    const selectedProjects = projects.filter((project) => selectedIds.has(project.id));
    if (selectedProjects.length === 0) return;

    const confirmed = window.confirm(
      selectedProjects.length === 1
        ? `Delete ${selectedProjects[0].name} permanently? This will also remove related activity and prompt links.`
        : `Delete ${selectedProjects.length} projects permanently? This will also remove related activity and prompt links.`
    );

    if (!confirmed) return;

    selectedProjects.forEach(handleDeleteProject);
    clearSelection();
  };

  const handleNewProject = () => {
    const newProject: SeedProject = {
      id: `new-${Date.now()}`,
      name: "New Project",
      short_description: "",
      status: "idea",
      project_type: "web_app",
      platform_name: "Lovable",
      platform_logo_slug: "lovable",
      account_label: "Primary",
      last_active_date: new Date().toISOString().split("T")[0],
      next_action: null,
      blocker_summary: null,
      confidence_score: 5,
      motivation_score: 5,
      monetisation_score: 5,
      platform_fit_score: 5,
      effort_score: 5,
      rescue_score: 50,
      is_stalled: false,
      priority: 3,
    };
    setProjects((prev) => [newProject, ...prev]);
    setDrawerProject(newProject);
    setDrawerOpen(true);
  };

  return (
    <AppShell title="Projects">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={(value) => setView(value as ViewMode)}>
              <TabsList className="grid grid-cols-4 w-[420px] max-w-full">
                <TabsTrigger value="card" className="gap-1.5"><LayoutGrid className="h-3.5 w-3.5" />Cards</TabsTrigger>
                <TabsTrigger value="table" className="gap-1.5"><List className="h-3.5 w-3.5" />Table</TabsTrigger>
                <TabsTrigger value="rescue" className="gap-1.5"><LifeBuoy className="h-3.5 w-3.5" />Rescue</TabsTrigger>
                <TabsTrigger value="heatmap" className="gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Heatmap</TabsTrigger>
              </TabsList>
            </Tabs>
            <span className="text-label text-muted-foreground tabular-nums">{filtered.length} project{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          <Button onClick={handleNewProject} className="bg-accent-violet hover:bg-accent-violet/90 text-primary-foreground rounded-md">
            <Plus className="h-4 w-4 mr-1.5" />
            New Project
          </Button>
        </div>

        <ProjectFiltersPanel filters={filters} onChange={setFilters} availableTags={TAG_OPTIONS} />

        {view === "card" && (
          <>
            {filtered.length === 0 ? <ProjectsEmptyState onClear={() => setFilters(DEFAULT_FILTERS)} /> : null}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onClick={openProject}
                  selected={selectedIds.has(p.id)}
                  onSelect={handleSelect}
                  tags={getProjectTags(p)}
                />
              ))}
            </div>
          </>
        )}

        {view === "table" && (
          <div className="bg-card card-shadow rounded-lg p-4">
            <ProjectTable
              projects={filtered}
              onRowClick={openProject}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              allSelected={filtered.length > 0 && selectedIds.size === filtered.length}
            />
            {filtered.length === 0 && <ProjectsEmptyState compact onClear={() => setFilters(DEFAULT_FILTERS)} />}
          </div>
        )}

        {view === "rescue" && (
          <div className="rounded-2xl border border-amber-200/20 bg-[oklch(0.85_0.12_85_/_0.04)] p-4 md:p-5">
            {rescueProjects.length === 0 ? <RescueEmptyState onClear={() => setFilters(DEFAULT_FILTERS)} /> : null}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {rescueProjects.map((project) => (
                <div key={project.id} className="space-y-3 rounded-lg border border-border bg-card p-4 card-shadow">
                  <ProjectCard
                    project={project}
                    onClick={openProject}
                    selected={selectedIds.has(project.id)}
                    onSelect={handleSelect}
                    tags={getProjectTags(project)}
                  />
                  <Button
                    onClick={() => openProject(project)}
                    className="w-full bg-accent-amber text-foreground hover:bg-accent-amber/90 rounded-md"
                  >
                    Run Diagnosis
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "heatmap" && (
          <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
            <div className="rounded-xl border border-border bg-card p-4 card-shadow">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-section-heading font-semibold">Activity Heatmap</h2>
                  <p className="text-body text-muted-foreground">12 months of project update activity.</p>
                </div>
                <span className="text-label text-muted-foreground">Click a day to inspect updates</span>
              </div>
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[760px]">
                  <CalendarHeatmap
                    startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                    endDate={new Date()}
                    values={heatmapValues}
                    classForValue={(value) => {
                      const count = value?.count ?? 0;
                      if (count === 0) return "heatmap-empty";
                      if (count === 1) return "heatmap-cyan-1";
                      if (count === 2) return "heatmap-cyan-2";
                      if (count === 3) return "heatmap-cyan-3";
                      return "heatmap-cyan-4";
                    }}
                    onClick={(value) => setHeatmapDate(value?.date ?? null)}
                    showWeekdayLabels
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 card-shadow">
              <h3 className="text-section-heading font-semibold">{heatmapDate ? `Updates for ${heatmapDate}` : "Select a day"}</h3>
              <p className="mt-1 text-body text-muted-foreground">
                {heatmapDate ? "Updates are grouped by project." : "Choose a highlighted cell to see the activity log for that day."}
              </p>

              <div className="mt-4 space-y-4 max-h-[520px] overflow-auto pr-1">
                {heatmapDate && heatmapGroupedUpdates.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-4 text-body text-muted-foreground">
                    No updates were logged on this date.
                  </div>
                )}
                {heatmapGroupedUpdates.map(([projectName, items]) => (
                  <div key={projectName} className="rounded-lg border border-border p-3">
                    <h4 className="font-medium text-foreground">{projectName}</h4>
                    <div className="mt-3 space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="rounded-md bg-muted/40 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="rounded-pill bg-accent-violet/10 px-2 py-0.5 text-label text-accent-violet capitalize">
                              {item.type.replace(/_/g, " ")}
                            </span>
                            <span className="text-label text-muted-foreground tabular-nums">{timeAgo(item.created_at)}</span>
                          </div>
                          <p className="mt-2 text-body text-foreground">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-4xl flex-wrap items-center gap-3 rounded-xl border border-border bg-bg-elevated px-4 py-3 card-shadow md:bottom-4">
          <span className="text-label font-medium tabular-nums">{selectedIds.size} selected</span>

          <Select value={bulkStatus} onValueChange={setBulkStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Set status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={applyBulkStatus} disabled={!bulkStatus}>
            <Archive className="mr-1.5 h-4 w-4" />Set Status
          </Button>

          <Select value={bulkAccount} onValueChange={setBulkAccount}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Assign account" /></SelectTrigger>
            <SelectContent>
              {ACCOUNT_OPTIONS.map((account) => <SelectItem key={account} value={account}>{account}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={applyBulkAccount} disabled={!bulkAccount}>
            <UserCog className="mr-1.5 h-4 w-4" />Assign Account
          </Button>

          <Select value={bulkTag} onValueChange={setBulkTag}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Add tag" /></SelectTrigger>
            <SelectContent>
              {TAG_OPTIONS.map((tag) => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={applyBulkTag} disabled={!bulkTag}>
            <Tag className="mr-1.5 h-4 w-4" />Add Tag
          </Button>

          <Button size="sm" className="bg-accent-red text-white hover:bg-accent-red/90" onClick={archiveSelected}>
            Archive
          </Button>

          <Button size="sm" className="bg-accent-red text-white hover:bg-accent-red/90" onClick={deleteSelected}>
            Delete
          </Button>

          <button onClick={clearSelection} className="ml-auto text-muted-foreground transition-colors hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <ProjectDrawer
        project={drawerProject}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        onDelete={handleDeleteProject}
        onAddNote={handleAddNote}
        updates={drawerProject ? projectUpdates[drawerProject.id] || [] : []}
        prompts={prompts.filter((prompt) => drawerProject ? prompt.linked_project_ids.includes(drawerProject.id) : false)}
        onLinkPrompt={(projectId, promptId) => {
          setPrompts((prev) => prev.map((prompt) => prompt.id === promptId ? { ...prompt, linked_project_ids: Array.from(new Set([...prompt.linked_project_ids, projectId])) } : prompt));
        }}
        isNew={drawerProject?.id.startsWith("new-")}
      />
    </AppShell>
  );
}

function ProjectsEmptyState({ onClear, compact = false }: { onClear: () => void; compact?: boolean }) {
  return (
    <div className={cn("rounded-xl border border-dashed border-border bg-card/70 p-6 text-center", compact ? "mt-4" : "mb-4") }>
      <div className="mx-auto mb-4 grid max-w-md grid-cols-1 gap-3 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-lg border border-border/70 bg-muted/40" />
        ))}
      </div>
      <p className="text-body text-foreground">No projects match these filters.</p>
      <p className="mt-1 text-body text-muted-foreground">Clear the filters or add your first project to start building your tracker.</p>
      <Button variant="outline" className="mt-4" onClick={onClear}>Clear all filters</Button>
    </div>
  );
}

function RescueEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="mb-4 rounded-xl border border-dashed border-amber-200/20 bg-card/80 p-6 text-center">
      <p className="text-body text-foreground">No rescue candidates right now. That’s a nice problem to have.</p>
      <p className="mt-1 text-body text-muted-foreground">Try broadening the filters if you expected stalled or paused work here.</p>
      <Button variant="outline" className="mt-4" onClick={onClear}>Clear all filters</Button>
    </div>
  );
}
