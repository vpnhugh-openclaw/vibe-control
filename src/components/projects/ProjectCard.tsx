import { SeedProject } from "@/lib/seedData";
import { StatusBadge } from "@/components/StatusBadge";
import { PlatformBadge } from "@/components/PlatformBadge";
import { AccountBadge } from "@/components/AccountBadge";
import { RescueScoreArc } from "@/components/RescueScoreArc";
import { timeAgo } from "@/lib/utils";

interface ProjectCardProps {
  project: SeedProject;
  onClick: (project: SeedProject) => void;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export function ProjectCard({ project, onClick, selected, onSelect }: ProjectCardProps) {
  const p = project;
  const isStale = new Date(p.last_active_date) < new Date(Date.now() - 7 * 86400000);
  const showRescue = ["stalled", "paused"].includes(p.status);

  return (
    <div
      className="bg-card card-shadow card-hover rounded-lg p-5 cursor-pointer relative group"
      onClick={() => onClick(p)}
    >
      {/* Stale indicator */}
      {isStale && (
        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-accent-amber" title="No update in 7+ days" />
      )}

      {/* Checkbox for bulk */}
      {onSelect && (
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(p.id, e.target.checked)}
            className="h-4 w-4 rounded border-border accent-accent-violet"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-[15px] leading-tight truncate">{p.name}</h3>
        {showRescue && <RescueScoreArc score={p.rescue_score} size={40} />}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <StatusBadge status={p.status} />
        <span className="inline-flex items-center px-2 py-0.5 rounded-pill text-label bg-muted text-muted-foreground capitalize">
          {p.project_type?.replace(/_/g, " ")}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <PlatformBadge name={p.platform_name} logoSlug={p.platform_logo_slug} />
        <AccountBadge label={p.account_label} />
      </div>

      {/* Meta */}
      <div className="space-y-1">
        <p className={`text-label tabular-nums ${isStale ? "text-accent-amber" : "text-muted-foreground"}`}>
          Updated {timeAgo(p.last_active_date)}
        </p>
        {p.next_action && (
          <p className="text-label text-muted-foreground truncate">{p.next_action}</p>
        )}
      </div>
    </div>
  );
}
