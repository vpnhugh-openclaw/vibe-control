import { SeedProject } from "@/lib/seedData";
import { StatusBadge } from "@/components/StatusBadge";
import { PlatformBadge } from "@/components/PlatformBadge";
import { AccountBadge } from "@/components/AccountBadge";
import { RescueScoreArc } from "@/components/RescueScoreArc";
import { timeAgo, cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface ProjectCardProps {
  project: SeedProject;
  onClick: (project: SeedProject) => void;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  tags?: string[];
}

export function ProjectCard({ project, onClick, selected, onSelect }: ProjectCardProps) {
  const p = project;
  const isStale = new Date(p.last_active_date) < new Date(Date.now() - 7 * 86400000);
  const showRescue = ["stalled", "paused"].includes(p.status);
  const platforms = [{ name: p.platform_name, logoSlug: p.platform_logo_slug }];

  return (
    <div
      className="bg-card card-shadow rounded-lg p-5 cursor-pointer relative transition-all duration-150 ease-out hover:-translate-y-[1px] hover:shadow-[var(--shadow-card-hover)]"
      onClick={() => onClick(p)}
    >
      {p.is_stalled && (
        <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-accent-amber" title="Project is stalled" />
      )}

      {onSelect && (
        <div className="absolute left-4 top-4" onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={selected} onCheckedChange={(checked) => onSelect(p.id, checked === true)} />
        </div>
      )}

      <div className="mb-4 flex items-start justify-between gap-3 pt-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="truncate font-semibold text-[15px] leading-tight text-foreground">{p.name}</h3>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusBadge status={p.status} />
            <span className="inline-flex items-center rounded-pill bg-muted px-2 py-0.5 text-label capitalize text-muted-foreground">
              {p.project_type?.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {showRescue && <RescueScoreArc score={p.rescue_score} size={48} />}
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {platforms.slice(0, 3).map((platform) => (
          <PlatformBadge key={platform.name} name={platform.name} logoSlug={platform.logoSlug} />
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <AccountBadge label={p.account_label} />
      </div>

      <div className="space-y-1.5">
        <p className={cn("text-label tabular-nums", isStale ? "text-accent-amber" : "text-muted-foreground")}>
          Updated {timeAgo(p.last_active_date)}
        </p>
        {p.next_action && (
          <p className="line-clamp-1 text-label text-muted-foreground">{p.next_action}</p>
        )}
      </div>
    </div>
  );
}
