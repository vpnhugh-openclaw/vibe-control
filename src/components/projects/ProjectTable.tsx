import { SeedProject } from "@/lib/seedData";
import { StatusBadge } from "@/components/StatusBadge";
import { PlatformBadge } from "@/components/PlatformBadge";
import { AccountBadge } from "@/components/AccountBadge";
import { timeAgo } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

type SortKey = "name" | "status" | "project_type" | "platform_name" | "account_label" | "rescue_score" | "last_active_date" | "priority";

interface ProjectTableProps {
  projects: SeedProject[];
  onRowClick: (project: SeedProject) => void;
  selectedIds?: Set<string>;
  onSelect?: (id: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  allSelected?: boolean;
}

export function ProjectTable({ projects, onRowClick, selectedIds, onSelect, onSelectAll, allSelected }: ProjectTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("last_active_date");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
      return sortAsc ? cmp : -cmp;
    });
  }, [projects, sortAsc, sortKey]);

  const cols: { key: SortKey; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
    { key: "project_type", label: "Type" },
    { key: "platform_name", label: "Platform(s)" },
    { key: "account_label", label: "Account" },
    { key: "rescue_score", label: "Rescue Score" },
    { key: "last_active_date", label: "Last Active" },
    { key: "priority", label: "Priority" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-body">
        <thead>
          <tr className="border-b border-border text-left text-label text-muted-foreground">
            {onSelect && (
              <th className="w-10 pb-2 pr-2">
                <Checkbox checked={allSelected} onCheckedChange={(checked) => onSelectAll?.(checked === true)} />
              </th>
            )}
            {cols.map((col) => (
              <th key={col.key} className="cursor-pointer pb-2 pr-4 transition-colors hover:text-foreground" onClick={() => handleSort(col.key)}>
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  <ArrowUpDown className="h-3 w-3 text-accent-violet" />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => {
            const isStale = new Date(p.last_active_date) < new Date(Date.now() - 7 * 86400000);
            return (
              <tr
                key={p.id}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-bg-active transition-colors duration-150"
                onClick={() => onRowClick(p)}
              >
                {onSelect && (
                  <td className="py-3 pr-2" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selectedIds?.has(p.id) ?? false} onCheckedChange={(checked) => onSelect(p.id, checked === true)} />
                  </td>
                )}
                <td className="py-3 pr-4 font-medium text-foreground">{p.name}</td>
                <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                <td className="py-3 pr-4 capitalize text-muted-foreground">{p.project_type?.replace(/_/g, " ")}</td>
                <td className="py-3 pr-4"><PlatformBadge name={p.platform_name} logoSlug={p.platform_logo_slug} /></td>
                <td className="py-3 pr-4"><AccountBadge label={p.account_label} /></td>
                <td className="py-3 pr-4 font-medium tabular-nums">{p.rescue_score}</td>
                <td className={`py-3 pr-4 tabular-nums ${isStale ? "text-accent-amber" : "text-muted-foreground"}`}>
                  {timeAgo(p.last_active_date)}
                </td>
                <td className="py-3 pr-4 tabular-nums">{p.priority}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
