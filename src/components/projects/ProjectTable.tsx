import { SeedProject } from "@/lib/seedData";
import { StatusBadge } from "@/components/StatusBadge";
import { PlatformBadge } from "@/components/PlatformBadge";
import { timeAgo } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface ProjectTableProps {
  projects: SeedProject[];
  onRowClick: (project: SeedProject) => void;
  selectedIds?: Set<string>;
  onSelect?: (id: string, checked: boolean) => void;
}

type SortKey = "name" | "status" | "project_type" | "platform_name" | "account_label" | "rescue_score" | "last_active_date" | "priority";

export function ProjectTable({ projects, onRowClick, selectedIds, onSelect }: ProjectTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("last_active_date");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sorted = [...projects].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
    return sortAsc ? cmp : -cmp;
  });

  const cols: { key: SortKey; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
    { key: "project_type", label: "Type" },
    { key: "platform_name", label: "Platform" },
    { key: "account_label", label: "Account" },
    { key: "rescue_score", label: "Rescue" },
    { key: "last_active_date", label: "Last Active" },
    { key: "priority", label: "Priority" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body">
        <thead>
          <tr className="text-left text-label text-muted-foreground border-b border-border">
            {onSelect && <th className="pb-2 pr-2 w-8" />}
            {cols.map((col) => (
              <th
                key={col.key}
                className="pb-2 pr-4 cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {sortKey === col.key && <ArrowUpDown className="h-3 w-3 text-accent-violet" />}
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
                className="border-b border-border last:border-0 hover:bg-bg-active cursor-pointer transition-colors duration-150"
                onClick={() => onRowClick(p)}
              >
                {onSelect && (
                  <td className="py-2.5 pr-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds?.has(p.id) ?? false}
                      onChange={(e) => onSelect(p.id, e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-accent-violet"
                    />
                  </td>
                )}
                <td className="py-2.5 pr-4 font-medium">{p.name}</td>
                <td className="py-2.5 pr-4"><StatusBadge status={p.status} /></td>
                <td className="py-2.5 pr-4 text-muted-foreground capitalize">{p.project_type?.replace(/_/g, " ")}</td>
                <td className="py-2.5 pr-4"><PlatformBadge name={p.platform_name} logoSlug={p.platform_logo_slug} /></td>
                <td className="py-2.5 pr-4 text-muted-foreground">{p.account_label}</td>
                <td className="py-2.5 pr-4 tabular-nums font-medium">{p.rescue_score}</td>
                <td className={`py-2.5 pr-4 tabular-nums ${isStale ? "text-accent-amber" : "text-muted-foreground"}`}>
                  {timeAgo(p.last_active_date)}
                </td>
                <td className="py-2.5 tabular-nums">{p.priority}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
