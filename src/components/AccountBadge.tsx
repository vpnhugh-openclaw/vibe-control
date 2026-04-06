import { cn } from "@/lib/utils";

interface AccountBadgeProps {
  label: string;
  email?: string;
  className?: string;
}

const colors = [
  "bg-accent-violet/15 text-accent-violet",
  "bg-accent-cyan/15 text-accent-cyan",
  "bg-accent-amber/15 text-accent-amber",
  "bg-accent-green/15 text-accent-green",
];

export function AccountBadge({ label, className }: AccountBadgeProps) {
  const colorIndex = label.charCodeAt(0) % colors.length;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-pill text-label",
        colors[colorIndex],
        className
      )}
    >
      <span className="flex items-center justify-center h-4 w-4 rounded-full bg-current/20 text-[9px] font-semibold">
        {label.charAt(0).toUpperCase()}
      </span>
      {label}
    </span>
  );
}
