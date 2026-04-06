import { ReactNode } from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import { TopBar } from "./TopBar";
import { MobileTabBar } from "./MobileTabBar";
import { useTheme } from "@/hooks/useTheme";

interface AppShellProps {
  children: ReactNode;
  title: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <DesktopSidebar theme={theme} toggleTheme={toggleTheme} />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar title={title} />
        <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <MobileTabBar />
    </div>
  );
}
