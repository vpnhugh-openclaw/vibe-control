import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { seedProjects, SeedProject } from "@/lib/seedData";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectTable } from "@/components/projects/ProjectTable";
import { ProjectFiltersPanel, ProjectFilters, DEFAULT_FILTERS } from "@/components/projects/ProjectFiltersPanel";
import { ProjectDrawer } from "@/components/projects/ProjectDrawer";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "card" | "table";

export default function ProjectsPage() {
  const [view, setView] = useState<ViewMode>("card");
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_FILTERS);
  const [projects, setProjects] = useState<SeedProject[]>(seedProjects);
  const [drawerProject, setDrawerProject] = useState<SeedProject | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");

  // Filter logic
  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filters.statuses.length > 0 && !filters.statuses.includes(p.status)) return false;
      if (filters.types.length > 0 && !filters.types.includes(p.project_type)) return false;
      if (filters.platforms.length > 0 && !filters.platforms.includes(p.platform_name)) return false;
      if (filters.accounts.length > 0 && !filters.accounts.includes(p.account_label)) return false;
      if (filters.stalledOnly && !p.is_stalled) return false;
      if (filters.updatedWithinDays > 0) {
        const cutoff = Date.now() - filters.updatedWithinDays * 86400000;
        if (new Date(p.last_active_date).getTime() < cutoff) return false;
      }
      if (p.rescue_score < filters.rescueScoreMin || p.rescue_score > filters.rescueScoreMax) return false;
      return true;
    });
  }, [projects, filters]);

  const openProject = (project: SeedProject) => {
    setDrawerProject(project);
    setDrawerOpen(true);
  };

  const handleSave = (updated: SeedProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkStatusChange = () => {
    if (!bulkStatus) return;
    setProjects((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, status: bulkStatus } : p))
    );
    setSelectedIds(new Set());
    setBulkStatus("");
  };

  const handleNewProject = () => {
    const newProject: SeedProject = {
      id: `new-${Date.now()}`,
      name: "New Project",
      short_description: "",
      status: "idea",
      project_type: "web_app",
      platform_name: "Lovable",
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
      {/* Header controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="inline-flex rounded-md bg-muted p-0.5">
            <button
              onClick={() => setView("card")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-label transition-colors",
                view === "card" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
            <button
              onClick={() => setView("table")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-label transition-colors",
                view === "table" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <List className="h-3.5 w-3.5" />
              Table
            </button>
          </div>

          <span className="text-label text-muted-foreground tabular-nums">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <Button onClick={handleNewProject} className="bg-accent-violet hover:bg-accent-violet/90 text-primary-foreground rounded-md">
          <Plus className="h-4 w-4 mr-1.5" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <ProjectFiltersPanel filters={filters} onChange={setFilters} />

      {/* Card View */}
      {view === "card" && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onClick={openProject}
              selected={selectedIds.has(p.id)}
              onSelect={handleSelect}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground text-body mb-2">No projects match your filters.</p>
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-accent-violet text-label hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="bg-card card-shadow rounded-lg p-4">
          <ProjectTable
            projects={filtered}
            onRowClick={openProject}
            selectedIds={selectedIds}
            onSelect={handleSelect}
          />
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-body mb-2">No projects match your filters.</p>
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-accent-violet text-label hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-40 bg-bg-elevated card-shadow border border-border rounded-lg px-4 py-3 flex items-center gap-3">
          <span className="text-label font-medium tabular-nums">{selectedIds.size} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="bg-background border border-border rounded-md px-2 py-1 text-label"
          >
            <option value="">Set Status…</option>
            {["idea", "planning", "building", "testing", "launched", "paused", "stalled", "abandoned"].map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={handleBulkStatusChange}
            disabled={!bulkStatus}
            className="bg-accent-violet hover:bg-accent-violet/90 text-primary-foreground rounded-md"
          >
            Apply
          </Button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Drawer */}
      <ProjectDrawer
        project={drawerProject}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        isNew={drawerProject?.id.startsWith("new-")}
      />
    </AppShell>
  );
}
