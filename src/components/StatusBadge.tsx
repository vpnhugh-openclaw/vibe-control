import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  idea: "badge-idea",
  planning: "badge-planning",
  building: "badge-building",
  testing: "badge-testing",
  launched: "badge-launched",
  paused: "badge-paused",
  stalled: "badge-stalled",
  abandoned: "badge-abandoned",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-pill text-label capitalize",
        statusStyles[status] || "badge-idea",
        className
      )}
    >
      {status}
    </span>
  );
}
