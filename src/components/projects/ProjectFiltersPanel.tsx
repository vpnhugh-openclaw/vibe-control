import { useState } from "react";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["idea", "planning", "building", "testing", "launched", "paused", "stalled", "abandoned"];
const PROJECT_TYPES = ["web_app", "mobile_app", "automation", "website_revamp", "scraping_tool", "api_integration", "pharmacy_business", "research_workflow", "other"];
const PLATFORMS = ["Lovable", "Replit", "Base44", "Manus", "Bolt", "v0", "Cursor", "Windsurf", "Claude Code", "GitHub Codespaces", "VS Code + Copilot", "Firebase Studio", "Antigravity"];
const ACCOUNTS = ["Primary", "Pharmacy", "Alt Dev"];
const UPDATED_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
  { label: "All", value: 0 },
];

export interface ProjectFilters {
  query: string;
  statuses: string[];
  types: string[];
  platforms: string[];
  accounts: string[];
  tags: string[];
  stalledOnly: boolean;
  updatedWithinDays: number;
  rescueScoreRange: [number, number];
  priorityRange: [number, number];
}

export const DEFAULT_FILTERS: ProjectFilters = {
  query: "",
  statuses: [],
  types: [],
  platforms: [],
  accounts: [],
  tags: [],
  stalledOnly: false,
  updatedWithinDays: 0,
  rescueScoreRange: [0, 100],
  priorityRange: [1, 5],
};

interface FiltersProps {
  filters: ProjectFilters;
  onChange: (filters: ProjectFilters) => void;
  availableTags?: string[];
}

export function ProjectFiltersPanel({ filters, onChange, availableTags = [] }: FiltersProps) {
  const [open, setOpen] = useState(false);

  const activeCount = [
    filters.query ? 1 : 0,
    filters.statuses.length,
    filters.types.length,
    filters.platforms.length,
    filters.accounts.length,
    filters.tags.length,
    filters.stalledOnly ? 1 : 0,
    filters.updatedWithinDays > 0 ? 1 : 0,
    filters.rescueScoreRange[0] > 0 || filters.rescueScoreRange[1] < 100 ? 1 : 0,
    filters.priorityRange[0] > 1 || filters.priorityRange[1] < 5 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const toggleMulti = (key: keyof Pick<ProjectFilters, "statuses" | "types" | "platforms" | "accounts" | "tags">, value: string) => {
    const arr = filters[key];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    onChange({ ...filters, [key]: next });
  };

  const clearAll = () => onChange(DEFAULT_FILTERS);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-label text-muted-foreground transition-colors duration-150 hover:bg-bg-active"
      >
        <Filter className="h-3.5 w-3.5" />
        Filters
        {activeCount > 0 && (
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-violet px-1 text-[10px] font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-5 rounded-lg bg-card p-4 card-shadow">
          <div className="flex items-center justify-between">
            <span className="text-section-heading font-semibold">Filter Projects</span>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-label text-accent-violet hover:underline">
                Clear all filters
              </button>
            )}
          </div>

          <div>
            <span className="mb-1.5 block text-label text-muted-foreground">Global search</span>
            <Input
              placeholder="Search name, blockers, next action, tags..."
              value={filters.query}
              onChange={(e) => onChange({ ...filters, query: e.target.value })}
            />
          </div>

          <FilterGroup label="Platform" options={PLATFORMS} selected={filters.platforms} onToggle={(v) => toggleMulti("platforms", v)} />
          <FilterGroup label="Account" options={ACCOUNTS} selected={filters.accounts} onToggle={(v) => toggleMulti("accounts", v)} />
          <FilterGroup label="Status" options={STATUSES} selected={filters.statuses} onToggle={(v) => toggleMulti("statuses", v)} />
          <FilterGroup label="Project Type" options={PROJECT_TYPES} selected={filters.types} onToggle={(v) => toggleMulti("types", v)} format={(v) => v.replace(/_/g, " ")} />
          <FilterGroup label="Tags" options={availableTags} selected={filters.tags} onToggle={(v) => toggleMulti("tags", v)} />

          <div>
            <div className="mb-1.5 flex items-center justify-between text-label text-muted-foreground">
              <span>Priority</span>
              <span className="tabular-nums">{filters.priorityRange[0]} - {filters.priorityRange[1]}</span>
            </div>
            <Slider
              min={1}
              max={5}
              step={1}
              value={filters.priorityRange}
              onValueChange={(value) => onChange({ ...filters, priorityRange: [value[0], value[1]] })}
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Switch checked={filters.stalledOnly} onCheckedChange={(checked) => onChange({ ...filters, stalledOnly: checked })} />
              <span className="text-body">Stalled only</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-label text-muted-foreground">Updated in last</span>
              <Select value={String(filters.updatedWithinDays)} onValueChange={(value) => onChange({ ...filters, updatedWithinDays: Number(value) })}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UPDATED_OPTIONS.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-label text-muted-foreground">
              <span>Rescue Score</span>
              <span className="tabular-nums">{filters.rescueScoreRange[0]} - {filters.rescueScoreRange[1]}</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={filters.rescueScoreRange}
              onValueChange={(value) => onChange({ ...filters, rescueScoreRange: [value[0], value[1]] })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, options, selected, onToggle, format }: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  format?: (v: string) => string;
}) {
  if (options.length === 0) return null;

  return (
    <div>
      <span className="mb-1.5 block text-label text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={cn(
              "rounded-pill px-2.5 py-1 text-label capitalize transition-colors duration-150",
              selected.includes(opt)
                ? "bg-accent-violet text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-bg-active hover:text-foreground"
            )}
          >
            {format ? format(opt) : opt}
          </button>
        ))}
      </div>
    </div>
  );
}
