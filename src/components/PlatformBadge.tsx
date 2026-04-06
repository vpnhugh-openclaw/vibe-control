import { cn } from "@/lib/utils";

interface PlatformBadgeProps {
  name: string;
  logoSlug?: string;
  className?: string;
}

export function PlatformBadge({ name, logoSlug, className }: PlatformBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-pill text-label bg-accent-cyan/10 text-accent-cyan",
        className
      )}
    >
      {logoSlug && (
        <img
          src={`https://cdn.simpleicons.org/${logoSlug}`}
          alt={name}
          className="h-3 w-3"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      {name}
    </span>
  );
}
