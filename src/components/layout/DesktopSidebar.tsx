import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Mail,
  Layers,
  Coins,
  BookOpen,
  Rss,
  DollarSign,
  Sun,
  Moon,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/accounts", icon: Mail, label: "Accounts" },
  { to: "/platforms", icon: Layers, label: "Platforms" },
  { to: "/credits", icon: Coins, label: "Credits" },
  { to: "/prompts", icon: BookOpen, label: "Prompts" },
  { to: "/discovery", icon: Rss, label: "Discovery" },
  { to: "/costs", icon: DollarSign, label: "Costs" },
];

interface DesktopSidebarProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export function DesktopSidebar({ theme, toggleTheme }: DesktopSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-16 xl:w-56 border-r border-border bg-card shrink-0 transition-all duration-200">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
        <Zap className="h-5 w-5 text-accent-violet shrink-0" />
        <span className="hidden xl:block text-section-heading font-semibold text-foreground truncate">
          VibeCodeTracker
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-0.5 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-body transition-colors duration-150",
                isActive
                  ? "bg-accent text-accent-violet font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="hidden xl:block truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-border">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-body text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-150"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 shrink-0" />
          ) : (
            <Moon className="h-4 w-4 shrink-0" />
          )}
          <span className="hidden xl:block">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </button>
      </div>
    </aside>
  );
}
