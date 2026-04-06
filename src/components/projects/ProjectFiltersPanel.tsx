import { useState } from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUSES = ["idea", "planning", "building", "testing", "launched", "paused", "stalled", "abandoned"];
const PROJECT_TYPES = ["web_app", "mobile_app", "automation", "website_revamp", "scraping_tool", "api_integration", "pharmacy_business", "research_workflow", "other"];
const PLATFORMS = ["Lovable", "Replit", "Base44", "Manus", "Bolt", "v0", "Cursor", "VS Code + Copilot"];
const ACCOUNTS = ["Primary", "Pharmacy", "Alt Dev"];
const UPDATED_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 },
  { label: "All time", value: 0 },
];

export interface ProjectFilters {
  statuses: string[];
  types: string[];
  platforms: string[];
  accounts: string[];
  stalledOnly: boolean;
  updatedWithinDays: number;
  rescueScoreMin: number;
  rescueScoreMax: number;
}

export const DEFAULT_FILTERS: ProjectFilters = {
  statuses: [],
  types: [],
  platforms: [],
  accounts: [],
  stalledOnly: false,
  updatedWithinDays: 0,
  rescueScoreMin: 0,
  rescueScoreMax: 100,
};

interface FiltersProps {
  filters: ProjectFilters;
  onChange: (filters: ProjectFilters) => void;
}

export function ProjectFiltersPanel({ filters, onChange }: FiltersProps) {
  const [open, setOpen] = useState(false);

  const activeCount = [
    filters.statuses.length,
    filters.types.length,
    filters.platforms.length,
    filters.accounts.length,
    filters.stalledOnly ? 1 : 0,
    filters.updatedWithinDays > 0 ? 1 : 0,
    filters.rescueScoreMin > 0 || filters.rescueScoreMax < 100 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const toggleMulti = (key: keyof Pick<ProjectFilters, "statuses" | "types" | "platforms" | "accounts">, value: string) => {
    const arr = filters[key];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    onChange({ ...filters, [key]: next });
  };

  const clearAll = () => onChange(DEFAULT_FILTERS);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-label text-muted-foreground bg-card border border-border hover:bg-bg-active transition-colors duration-150"
      >
        <Filter className="h-3.5 w-3.5" />
        Filters
        {activeCount > 0 && (
          <span className="flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-accent-violet text-[10px] font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-3 bg-card card-shadow rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-section-heading font-semibold">Filter Projects</span>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-label text-accent-violet hover:underline">
                Clear all
              </button>
            )}
          </div>

          {/* Status */}
          <FilterGroup label="Status" options={STATUSES} selected={filters.statuses} onToggle={(v) => toggleMulti("statuses", v)} />

          {/* Type */}
          <FilterGroup label="Project Type" options={PROJECT_TYPES} selected={filters.types} onToggle={(v) => toggleMulti("types", v)} format={(v) => v.replace(/_/g, " ")} />

          {/* Platform */}
          <FilterGroup label="Platform" options={PLATFORMS} selected={filters.platforms} onToggle={(v) => toggleMulti("platforms", v)} />

          {/* Account */}
          <FilterGroup label="Account" options={ACCOUNTS} selected={filters.accounts} onToggle={(v) => toggleMulti("accounts", v)} />

          {/* Toggles row */}
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-body cursor-pointer">
              <input
                type="checkbox"
                checked={filters.stalledOnly}
                onChange={(e) => onChange({ ...filters, stalledOnly: e.target.checked })}
                className="h-4 w-4 rounded accent-accent-violet"
              />
              Stalled only
            </label>

            <div className="flex items-center gap-2">
              <span className="text-label text-muted-foreground">Updated within:</span>
              <select
                value={filters.updatedWithinDays}
                onChange={(e) => onChange({ ...filters, updatedWithinDays: Number(e.target.value) })}
                className="bg-background border border-border rounded-md px-2 py-1 text-label"
              >
                {UPDATED_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rescue score range */}
          <div>
            <span className="text-label text-muted-foreground block mb-1">Rescue Score Range</span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={filters.rescueScoreMin}
                onChange={(e) => onChange({ ...filters, rescueScoreMin: Number(e.target.value) })}
                className="flex-1 accent-accent-violet"
              />
              <span className="text-label tabular-nums w-8 text-center">{filters.rescueScoreMin}</span>
              <span className="text-muted-foreground">–</span>
              <input
                type="range"
                min={0}
                max={100}
                value={filters.rescueScoreMax}
                onChange={(e) => onChange({ ...filters, rescueScoreMax: Number(e.target.value) })}
                className="flex-1 accent-accent-violet"
              />
              <span className="text-label tabular-nums w-8 text-center">{filters.rescueScoreMax}</span>
            </div>
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
  return (
    <div>
      <span className="text-label text-muted-foreground block mb-1.5">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={cn(
              "px-2.5 py-1 rounded-pill text-label transition-colors duration-150 capitalize",
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
