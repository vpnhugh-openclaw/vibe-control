import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Mail,
  BookOpen,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/accounts", icon: Mail, label: "Accounts" },
  { to: "/prompts", icon: BookOpen, label: "Prompts" },
  { to: "/platforms", icon: Layers, label: "More" },
];

export function MobileTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-14 bg-card border-t border-border">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors duration-150",
              isActive ? "text-accent-violet" : "text-muted-foreground"
            )
          }
        >
          <tab.icon className="h-5 w-5" />
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
