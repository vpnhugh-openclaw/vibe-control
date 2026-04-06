import { Search, Bell } from "lucide-react";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-border bg-card shrink-0">
      <h1 className="text-page-title font-semibold text-foreground truncate">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-label text-muted-foreground bg-accent hover:bg-bg-active transition-colors duration-150"
          title="Search (⌘K)"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-background border border-border">
            ⌘K
          </kbd>
        </button>
        <button className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-150">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
